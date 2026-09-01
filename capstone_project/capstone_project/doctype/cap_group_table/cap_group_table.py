# Copyright (c) 2026, IE and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class CAPGroupTable(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		firstname_th: DF.Data | None
		lastname_th: DF.Data | None
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		student_id: DF.Link
	# end: auto-generated types

	pass
