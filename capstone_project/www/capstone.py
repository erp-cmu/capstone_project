import frappe


def get_context(context):
	"""Controller for the /cap web page (pairs with cap.html in this www folder).

	Frappe calls this automatically before rendering cap.html. It generates a
	CSRF token tied to the current session and puts it on the context so the
	template can use it (e.g. as {{ csrf_token }} or via frappe.csrf_token) to
	authenticate any frappe.call/AJAX POST requests made from the page. The
	db.commit() flushes the session changes made while fetching the token;
	the nosempgrep comment suppresses a lint rule that normally flags manual
	commit() calls as risky. The passed-in context is discarded and replaced
	with a fresh frappe._dict() containing just the csrf_token.
	"""
	csrf_token = frappe.sessions.get_csrf_token()
	frappe.db.commit()  # nosempgrep
	context = frappe._dict()
	context.csrf_token = csrf_token
	return context
