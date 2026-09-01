# Copyright (c) 2026, IE and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class CAPGroup(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from capstone_project.capstone_project.doctype.cap_group_table.cap_group_table import CAPGroupTable
		from frappe.types import DF

		advisor: DF.Link | None
		amended_from: DF.Link | None
		coadvisor: DF.Link | None
		curriculum: DF.Link
		evaluation_year: DF.Link
		group_nickname: DF.Data | None
		group_number: DF.Int
		members: DF.Table[CAPGroupTable]
	# end: auto-generated types

	def autoname(self):
		# Generate the name based on the evaluation year, curriculum, and group number
		tmp = f"{self.curriculum}-{self.evaluation_year}-G{self.group_number}"
		count = frappe.db.count("CAP Group", {"name": tmp})
		if count > 0:
			frappe.throw(f"CAP Group with name '{tmp}' already exists. Please use a different group number.")
		else:
			self.name = tmp
