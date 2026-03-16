# 委托给 pm-copilot 子项目
install dev dev-backend dev-frontend playground lint start-backend start-frontend:
	$(MAKE) -C pm-copilot $@

.PHONY: install dev dev-backend dev-frontend playground lint start-backend start-frontend
