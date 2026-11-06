package controller

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/pkg/cnip"

	"github.com/gin-gonic/gin"
)

// TopkenX shows each customer's money in one fixed currency, CNY or VND,
// chosen the first time their account is used and kept afterwards (VPN or a
// language switch does not change it). An admin can change it per customer.
const (
	userCurrencyCNY = "CNY"
	userCurrencyVND = "VND"
)

// decideUserCurrency picks the currency for a customer from this request:
// a mainland China IP means CNY; otherwise the UI language the browser sends
// in X-UI-Lang decides (Vietnamese means VND, anything else CNY).
func decideUserCurrency(c *gin.Context) string {
	if cnip.IsChina(c.ClientIP()) {
		return userCurrencyCNY
	}
	lang := strings.ToLower(strings.TrimSpace(c.GetHeader("X-UI-Lang")))
	if strings.HasPrefix(lang, "vi") {
		return userCurrencyVND
	}
	return userCurrencyCNY
}

// ensureUserCurrency fixes a customer's currency the first time it is needed
// and returns it. Admins have none: their pages follow the UI language.
func ensureUserCurrency(c *gin.Context, user *model.User) string {
	setting := user.GetSetting()
	if setting.Currency != "" || user.Role >= common.RoleAdminUser {
		return setting.Currency
	}
	setting.Currency = decideUserCurrency(c)
	if err := model.UpdateUserSetting(user.Id, setting); err != nil {
		common.SysLog(common.LogText("failed to save user currency: %s", err.Error()))
		return setting.Currency
	}
	user.SetSetting(setting)
	return setting.Currency
}

type adminSetUserCurrencyRequest struct {
	Currency string `json:"currency"`
}

// AdminSetUserCurrency sets (or clears, with "") one customer's display
// currency. Cleared accounts get a fresh choice on their next visit.
func AdminSetUserCurrency(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		common.ApiErrorMsg(c, "invalid user id")
		return
	}
	var req adminSetUserCurrencyRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		common.ApiErrorMsg(c, "invalid request")
		return
	}
	currency := strings.ToUpper(strings.TrimSpace(req.Currency))
	if currency != "" && currency != userCurrencyCNY && currency != userCurrencyVND {
		common.ApiErrorMsg(c, "currency must be CNY or VND")
		return
	}
	user, err := model.GetUserById(id, true)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	setting := user.GetSetting()
	setting.Currency = currency
	if err := model.UpdateUserSetting(user.Id, setting); err != nil {
		common.ApiError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    gin.H{"currency": currency},
	})
}
