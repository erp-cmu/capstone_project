# Copyright (c) 2026, IE and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class CAPEvalComplex(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		amended_from: DF.Link | None
		criteria_1: DF.Rating
		evaluator: DF.DynamicLink | None
		evaluator_name: DF.Data | None
		evaluator_type: DF.Link | None
		group: DF.Link | None
		title: DF.SmallText | None
	# end: auto-generated types

	pass
