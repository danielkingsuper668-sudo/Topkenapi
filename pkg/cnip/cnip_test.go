package cnip

import (
	"strings"
	"testing"
)

const sample = `2|apnic|20261106|1|19830613|20261105|+1000
apnic|*|ipv4|*|1|summary
apnic|CN|ipv4|1.0.1.0|256|20110414|allocated
apnic|CN|ipv4|36.96.0.0|2097152|20100810|allocated
apnic|VN|ipv4|14.160.0.0|1048576|20090113|allocated
apnic|CN|ipv6|2400:da00::|32|20100816|allocated
apnic|JP|ipv6|2400:4000::|22|20100118|allocated
`

func TestIsChina(t *testing.T) {
	tbl, err := parse(strings.NewReader(sample))
	if err != nil {
		t.Fatal(err)
	}
	mu.Lock()
	current = tbl
	mu.Unlock()
	cases := map[string]bool{
		"1.0.1.5":        true,
		"1.0.2.0":        false,
		"36.100.1.1":     true,
		"36.128.0.0":     false,
		"14.161.0.1":     false, // Vietnam
		"2400:da00::1":   true,
		"2400:4000::1":   false,
		"127.0.0.1":      false,
		"not-an-ip":      false,
		" 36.96.0.0 ":    true,
		"36.127.255.255": true,
	}
	for ip, want := range cases {
		if got := IsChina(ip); got != want {
			t.Errorf("IsChina(%q) = %v, want %v", ip, got, want)
		}
	}
}
