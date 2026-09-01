# Copyright (c) 2026, IE and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class CAPEvalScore(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		party_type: DF.Link | None
		party_type_dynamic: DF.DynamicLink | None
		score_raw: DF.Float
		score_scaled: DF.Float
	# end: auto-generated types

	pass
