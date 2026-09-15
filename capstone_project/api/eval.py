import frappe


@frappe.whitelist(allow_guest=False, methods=["POST"])
def get_eval_data():

	employee_name = frappe.form_dict.get("employee_name", "")

	if employee_name == "":
		filters = {"docstatus": ["!=", 2]}
	else:
		filters = {"evaluator": employee_name, "docstatus": ["!=", 2]}

	eval_names = frappe.get_all(
		"CAP Eval",
		filters=filters,
		fields=["name"],
		order_by="creation desc",
		limit=10000,
		ignore_permissions=True,
	)

	# TODO: The current get_doc is inefficient for large number of doc.
	# TODO: Change the implementation into 2-trip query
	# evals = frappe.get_all("CAP Eval", fields=["name", "evaluator"], limit=10000)
	# eval_names = [e.name for e in evals]
	# all_scores = frappe.get_all(
	# 	"CAP Eval Score",
	# 	filters={"parent": ["in", eval_names]},
	# 	fields=["parent", "score_field_1", "score_field_2"]
	# )
	evals = []
	for _eval in eval_names:
		_doc = frappe.get_doc("CAP Eval", _eval.name)
		evals.append(_doc)

	# Flatten
	evals_scores = []
	for _eval in evals:
		_eval_dict = _eval.as_dict()
		del _eval_dict["scores"]
		_eval_dict = {f"eval_{k}": v for k, v in _eval_dict.items()}

		for _score in _eval.scores:
			_score_dict = _score.as_dict()
			_score_dict = {f"score_{k}": v for k, v in _score_dict.items()}
			combined_dict = {**_eval_dict, **_score_dict}
			evals_scores.append(combined_dict)

	return evals_scores


@frappe.whitelist(allow_guest=False, methods=["POST"])
def edit_score_value():
	name = frappe.form_dict.get("name", "")
	score_raw = frappe.form_dict.get("score_raw", "")
	score_scaled = frappe.form_dict.get("score_scaled", "")
	print(f"Editing score value for {name}: score_raw={score_raw}, score_scaled={score_scaled}")

	# Update multiple fields at once
	frappe.db.set_value("CAP Eval Score", name, {"score_raw": score_raw, "score_scaled": score_scaled})
	return {"name": name, "score_raw": score_raw, "score_scaled": score_scaled}
