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
		scores: DF.Table[CAPEvalScore]
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
				# Construct the CLO description text with both English and Thai descriptions
				des_en = clo.description_en
				des_th = clo.description_th
				des_text = f"English: {des_en}\nThai: {des_th}"
				# Set the clo_description field in the CAP Eval document
				self.clo_description = des_text
				found_clo = True
				break
		if not found_clo:
			frappe.throw(
				f"CLO with number '{self.clo_number}' not found in the selected EDU Course CI document."
			)

		found_rubric = False
		for rubric in course_ci.rubric_table:
			if rubric.clo_number == self.clo_number:
				# Construct the rubric text with scores and descriptions
				d0 = rubric.description_score_0
				d1 = rubric.description_score_1
				d2 = rubric.description_score_2
				d3 = rubric.description_score_3
				d4 = rubric.description_score_4
				rubric_text = f"Score 0: {d0}\nScore 1: {d1}\nScore 2: {d2}\nScore 3: {d3}\nScore 4: {d4}"
				# Set the rubric field in the CAP Eval document
				self.rubric = rubric_text
				found_rubric = True
				break
		if not found_rubric:
			frappe.throw(
				f"Rubric for CLO number '{self.clo_number}' not found in the selected EDU Course CI document."
			)

	def fill_recipient_info(self):
		if self.scores:
			for score in self.scores:
				if score.recipient_type == "CAP Group":
					# Get the CAP Group document based on the recipient field
					cap_group = frappe.get_doc("CAP Group", score.recipient_type_dynamic)
					# Fill in the recipient information fields in the CAP Eval Score document
					group_number = cap_group.group_number
					group_nickname = cap_group.group_nickname if cap_group.group_nickname else ""
					info = f"G{group_number} - {group_nickname}" if group_nickname else f"G{group_number}"
					score.recipient_information = info
				elif score.recipient_type == "EDU Student":
					# Get the EDU Student document based on the recipient field
					edu_student = frappe.get_doc("EDU Student", score.recipient_type_dynamic)
					# Fill in the recipient information fields in the CAP Eval Score document
					firstname_th = edu_student.firstname_th if edu_student.firstname_th else ""
					lastname_th = edu_student.lastname_th if edu_student.lastname_th else ""
					firstname_en = edu_student.firstname_en if edu_student.firstname_en else ""
					lastname_en = edu_student.lastname_en if edu_student.lastname_en else ""
					full_name_th = f"{firstname_th} {lastname_th}".strip()
					full_name_en = f"{firstname_en} {lastname_en}".strip()
					if full_name_th and full_name_en:
						info = f"{full_name_th} / {full_name_en}"
					elif full_name_th:
						info = full_name_th
					elif full_name_en:
						info = full_name_en
					else:
						info = ""
					score.recipient_information = info
				else:
					frappe.throw(f"Unknown recipient type: {score.recipient_type}")
				pass

	def before_save(self):
		self.pull_clo_info()
		self.fill_recipient_info()
