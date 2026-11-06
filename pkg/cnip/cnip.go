// Package cnip tells whether a client IP is in mainland China or in Vietnam.
//
// TopkenX fixes each customer's currency (CNY or VND) partly from their IP,
// so it only needs those two verdicts. The data is APNIC's public delegation
// file (CC = "CN" and "VN" rows), downloaded to
// the data directory and refreshed weekly. No third-party library or account
// is needed. Until the file has loaded, every lookup answers false.
package cnip

import (
	"bufio"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	defaultSourceURL = "https://ftp.apnic.net/stats/apnic/delegated-apnic-latest"
	refreshEvery     = 7 * 24 * time.Hour
)

type v4Range struct{ start, end uint32 }

type table struct {
	v4 []v4Range
	v6 []*net.IPNet
}

// countries kept from the APNIC file
var countries = map[string]bool{"CN": true, "VN": true}

var (
	mu     sync.RWMutex
	tables map[string]*table
	once   sync.Once
)

// Start loads the CN table from dataDir (downloading it when missing or
// older than a week) and keeps it fresh in the background. Safe to call more
// than once; only the first call does anything.
func Start(dataDir string) {
	once.Do(func() {
		path := filepath.Join(dataDir, "geo", "delegated-apnic-latest")
		if v := strings.TrimSpace(os.Getenv("CNIP_FILE")); v != "" {
			path = v
		}
		source := defaultSourceURL
		if v := strings.TrimSpace(os.Getenv("CNIP_SOURCE_URL")); v != "" {
			source = v
		}
		go run(path, source)
	})
}

func run(path, source string) {
	for {
		if stale(path) {
			if err := download(source, path); err != nil {
				log.Printf("cnip: download failed: %v", err)
			}
		}
		if err := load(path); err != nil {
			log.Printf("cnip: load failed: %v", err)
		}
		time.Sleep(refreshEvery)
	}
}

func stale(path string) bool {
	info, err := os.Stat(path)
	return err != nil || time.Since(info.ModTime()) > refreshEvery
}

func download(source, path string) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	client := &http.Client{Timeout: 2 * time.Minute}
	resp, err := client.Get(source)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return &httpError{resp.StatusCode}
	}
	tmp := path + ".tmp"
	f, err := os.Create(tmp)
	if err != nil {
		return err
	}
	if _, err := io.Copy(f, resp.Body); err != nil {
		f.Close()
		os.Remove(tmp)
		return err
	}
	if err := f.Close(); err != nil {
		os.Remove(tmp)
		return err
	}
	return os.Rename(tmp, path)
}

type httpError struct{ code int }

func (e *httpError) Error() string { return "unexpected HTTP status " + strconv.Itoa(e.code) }

func load(path string) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()
	parsed, err := parse(f)
	if err != nil {
		return err
	}
	mu.Lock()
	tables = parsed
	mu.Unlock()
	for cc, t := range parsed {
		log.Printf("cnip: loaded %d IPv4 and %d IPv6 %s ranges", len(t.v4), len(t.v6), cc)
	}
	return nil
}

// parse reads APNIC's delegated stats format:
// registry|cc|type|start|value|date|status
// For ipv4, value is an address count; for ipv6 it is a prefix length.
func parse(r io.Reader) (map[string]*table, error) {
	out := map[string]*table{}
	sc := bufio.NewScanner(r)
	sc.Buffer(make([]byte, 64*1024), 1024*1024)
	for sc.Scan() {
		line := sc.Text()
		if line == "" || line[0] == '#' {
			continue
		}
		parts := strings.Split(line, "|")
		if len(parts) < 7 || !countries[parts[1]] {
			continue
		}
		t := out[parts[1]]
		if t == nil {
			t = &table{}
			out[parts[1]] = t
		}
		switch parts[2] {
		case "ipv4":
			ip := net.ParseIP(parts[3]).To4()
			count, err := strconv.ParseUint(parts[4], 10, 32)
			if ip == nil || err != nil || count == 0 {
				continue
			}
			start := ipv4ToUint(ip)
			end := uint64(start) + count - 1
			if end > 0xFFFFFFFF {
				end = 0xFFFFFFFF
			}
			t.v4 = append(t.v4, v4Range{start, uint32(end)})
		case "ipv6":
			_, n, err := net.ParseCIDR(parts[3] + "/" + parts[4])
			if err == nil {
				t.v6 = append(t.v6, n)
			}
		}
	}
	if err := sc.Err(); err != nil {
		return nil, err
	}
	for _, t := range out {
		sort.Slice(t.v4, func(i, j int) bool { return t.v4[i].start < t.v4[j].start })
	}
	return out, nil
}

func ipv4ToUint(ip net.IP) uint32 {
	return uint32(ip[0])<<24 | uint32(ip[1])<<16 | uint32(ip[2])<<8 | uint32(ip[3])
}

// IsChina reports whether ip (a textual IPv4 or IPv6 address) belongs to a
// range APNIC lists for CN. Unknown, private or unparsable addresses are not.
func IsChina(ip string) bool { return in("CN", ip) }

// IsVietnam is IsChina for VN.
func IsVietnam(ip string) bool { return in("VN", ip) }

func in(cc, ip string) bool {
	parsed := net.ParseIP(strings.TrimSpace(ip))
	if parsed == nil {
		return false
	}
	mu.RLock()
	t := tables[cc]
	mu.RUnlock()
	if t == nil {
		return false
	}
	if v4 := parsed.To4(); v4 != nil {
		n := ipv4ToUint(v4)
		i := sort.Search(len(t.v4), func(i int) bool { return t.v4[i].end >= n })
		return i < len(t.v4) && t.v4[i].start <= n
	}
	for _, block := range t.v6 {
		if block.Contains(parsed) {
			return true
		}
	}
	return false
}
