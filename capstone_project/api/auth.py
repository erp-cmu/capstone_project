import frappe


@frappe.whitelist(allow_guest=True)
def get_current_user_info():

	ADMIN_USERS = ["Administrator"]
	current_user = frappe.session.user

	if current_user == "Guest":
		frappe.throw("You must be logged in to view this information", frappe.PermissionError)

	dt = {}
	_res = frappe.db.get_value(
		"User", current_user, ["first_name", "last_name", "email", "user_image"], as_dict=True
	)
	dt["username"] = current_user
	dt["first_name"] = _res.get("first_name") if _res else ""
	dt["last_name"] = _res.get("last_name") if _res else ""
	dt["email"] = _res.get("email") if _res else ""
	dt["user_image"] = _res.get("user_image") if _res else ""

	# user_details["roles"] = frappe.get_roles(current_user)

	_res = frappe.db.get_value(
		"Employee", {"user_id": current_user}, fieldname=["name", "first_name", "middle_name"], as_dict=True
	)
	if _res:
		dt["is_employee"] = True
		dt["emp_name"] = _res.get("name") if _res else ""
		dt["emp_fullname_th"] = _res.get("first_name") if _res else ""
		dt["emp_name_code"] = _res.get("middle_name") if _res else ""
	else:
		dt["is_employee"] = False
		dt["emp_name"] = ""
		dt["emp_fullname_th"] = ""
		dt["emp_name_code"] = ""

	if current_user in ADMIN_USERS:
		dt["role"] = "ADMIN"
	else:
		dt["role"] = "USER"
	return dt
