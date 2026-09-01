# Copyright (c) 2026, IE and contributors
# For license information, please see license.txt

import re

import frappe
from frappe.model.document import Document


class CAPEval(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from capstone_project.capstone_project.doctype.cap_eval_list.cap_eval_list import CAPEvalList
		from capstone_project.capstone_project.doctype.cap_eval_score.cap_eval_score import CAPEvalScore
		from frappe.types import DF

		amended_from: DF.Link | None
		clo_number: DF.Int
		curriculum: DF.Link
		evaluation_list: DF.Table[CAPEvalList]
		evaluation_round: DF.Literal["Proposal", "Progressive", "Final"]
		evaluation_year: DF.Link
		evaluator: DF.DynamicLink
		evaluator_type: DF.Link | None
		rubric: DF.SmallText | None
		score: DF.Table[CAPEvalScore]
	# end: auto-generated types

	def autoname(self):
		# Get employee name
		mn_tmp = frappe.get_value("Employee", self.evaluator, "middle_name")
		match = re.search(r"\((\w+)\)", mn_tmp)
		if match:
			mn = match.group(1)
		else:
			frappe.throw(f"Middle name (code) not found in employee {self.evaluator}")

		tmp = f"{self.evaluation_year}-{self.curriculum}-{self.evaluation_round}-{mn.upper()}-CLO{self.clo_number}"
		count = frappe.db.count("CAP Eval", {"name": ["like", f"{tmp}%"]})
		if count > 0:
			self.name = f"{tmp} ({count + 1})"
		else:
			self.name = tmp
