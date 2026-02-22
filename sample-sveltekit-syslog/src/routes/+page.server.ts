import type { Actions, PageServerLoad } from "./$types";
import { appLog, authLog } from "$lib/server/logger";
import type { SyslogPriority } from "@trasherdk/posix-syslog";
import { fail } from "@sveltejs/kit";

const priorities: SyslogPriority[] = [
	"emerg", "alert", "crit", "err", "warning", "notice", "info", "debug",
];

const facilities = ["app", "auth"] as const;

export const load: PageServerLoad = () => {
	return { priorities, facilities };
};

export const actions = {
	log: async ({ request }) => {
		const data = await request.formData();
		const message = data.get("message")?.toString().trim();
		const priority = data.get("priority")?.toString() as SyslogPriority;
		const facility = data.get("facility")?.toString();

		if (!message) {
			return fail(400, { error: "Message is required", message, priority, facility });
		}

		if (!priorities.includes(priority)) {
			return fail(400, { error: "Invalid priority", message, priority, facility });
		}

		const logger = facility === "auth" ? authLog : appLog;
		logger[priority](message);

		const target = facility === "auth" ? "auth" : "local0";
		return {
			success: true,
			sent: { priority, facility: target, message },
		};
	},
} satisfies Actions;
