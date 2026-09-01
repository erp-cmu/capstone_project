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
		capstone_course: DF.Link | None
		clo_description: DF.SmallText | None
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
		if self.evaluator_type == "Employee":
			# Get employee middle name (code) from the Employee doctype
			mn_tmp = frappe.get_value("Employee", self.evaluator, "middle_name")
			match = re.search(r"\((\w+)\)", mn_tmp)
			if match:
				mn = match.group(1)
			else:
				frappe.throw(f"Middle name (code) not found in employee {self.evaluator}")
		else:
			# TODO: Handle other evaluator types if needed
			frappe.throw("Please use Employee as evaluator type for now. Other types are not supported yet.")

		tmp = f"{self.evaluation_year}-{self.curriculum}-{self.evaluation_round}-{mn.upper()}-CLO{self.clo_number}"
		count = frappe.db.count("CAP Eval", {"name": ["like", f"{tmp}%"]})
		if count > 0:
			self.name = f"{tmp} ({count + 1})"
		else:
			self.name = tmp

	def pull_clo_info(self):
		# Get the CLO description from the EDU Course CI doctype based on the curriculum and CLO number
		# Get the parent EDU Course CI document based on the curriculum and evaluation year

		# Count the number of EDU Course CI documents with the same curriculum and evaluation year
		records = frappe.db.get_all(
			"EDU Course CI",
			filters={
				"curriculum": self.curriculum,
				"evaluation_year": self.evaluation_year,
				"course": self.capstone_course,
				"docstatus": ["in", [0, 1]],  # Count only Draft and Submitted documents
			},
			fields=["name"],
		)
		count = len(records)
		if count == 0:
			frappe.throw(
				f"No EDU Course CI document found for curriculum '{self.curriculum}', evaluation year '{self.evaluation_year}', and course '{self.capstone_course}'."
			)
		elif count > 1:
			frappe.throw(
				f"Multiple EDU Course CI documents found for curriculum '{self.curriculum}', evaluation year '{self.evaluation_year}', and course '{self.capstone_course}'. Please ensure there is only one."
			)
		course_ci = frappe.get_doc("EDU Course CI", records[0]["name"])

		found_clo = False
		for clo in course_ci.clo_table:
			if clo.clo_number == self.clo_number:
				self.clo_description = clo.description_en
				found_clo = True
				break
		if not found_clo:
			frappe.throw(
				f"CLO with number '{self.clo_number}' not found in the selected EDU Course CI document."
			)

		found_rubric = False
		for rubric in course_ci.rubric_table:
			if rubric.clo_number == self.clo_number:
				self.rubric = rubric.rubric
				found_rubric = True
				break
		if not found_rubric:
			frappe.throw(
				f"Rubric for CLO number '{self.clo_number}' not found in the selected EDU Course CI document."
			)

	def before_save(self):
		self.pull_clo_info()
