// Copyright (c) 2026, IE and contributors
// For license information, please see license.txt

frappe.ui.form.on("CAP Eval", {
	refresh(frm) {
		frm.set_query("evaluator_type", function () {
			return {
				filters: {
					name: ["in", ["Employee"]], // Add more evaluator types if needed
				},
			};
		});
		// Trigger the filter when the form is refreshed
		set_child_table_filters(frm);
	},
	scaling_method(frm) {
		if (frm.doc.scaling_method === "Threshold") {
			// Show the threshold fields and make them required
			frm.set_df_property("threshold_1", "hidden", 0);
			frm.set_df_property("threshold_2", "hidden", 0);
			frm.set_df_property("threshold_3", "hidden", 0);
			frm.set_df_property("threshold_4", "hidden", 0);
			// Make the threshold fields required
			frm.set_df_property("threshold_1", "reqd", 1);
			frm.set_df_property("threshold_2", "reqd", 1);
			frm.set_df_property("threshold_3", "reqd", 1);
			frm.set_df_property("threshold_4", "reqd", 1);
		} else if (frm.doc.scaling_method === "Linear") {
			// Hide the threshold fields and make them not required
			frm.set_df_property("threshold_1", "hidden", 1);
			frm.set_df_property("threshold_2", "hidden", 1);
			frm.set_df_property("threshold_3", "hidden", 1);
			frm.set_df_property("threshold_4", "hidden", 1);
			// Make the threshold fields not required
			frm.set_df_property("threshold_1", "reqd", 0);
			frm.set_df_property("threshold_2", "reqd", 0);
			frm.set_df_property("threshold_3", "reqd", 0);
			frm.set_df_property("threshold_4", "reqd", 0);
		} else {
			console.log("Unknown scaling method: " + frm.doc.scaling_method);
		}
	},
});

// Trigger the filter when a new row is added to the child table
frappe.ui.form.on("CAP Eval Score", {
	items_add(frm, cdt, cdn) {
		set_child_table_filters(frm);
	},

	// This function is triggered when the recipient_type field in the child table is changed.
	recipient_type_dynamic(frm, cdt, cdn) {
		// TODO: update the recipient_information field.
		// let row = frappe.model.get_doc(cdt, cdn);
		// console.log({ row });
	},
});

function set_child_table_filters(frm) {
	// 1. 'scores' is the fieldname of the child table inside the Parent DocType
	// 2. 'recipient_type' is the fieldname of the DocType selector inside the Child Table
	frm.set_query("recipient_type", "scores", function (doc, cdt, cdn) {
		return {
			filters: {
				name: ["in", ["CAP Group", "EDU Student"]], // Your allowed DocTypes
			},
		};
	});
}
