import meeseOS from "meeseOS";
import { name as applicationName } from "./metadata.json";

// Creates the internal callback function when MeeseOS launches an application
// Note the first argument is the "name" taken from your metadata.json file
const register = (core, args, options, metadata) => {
	// Date is the first day I implemented uptime monitoring with this site
	const url = "https://webstatus.ai/s/aaronmeese.com/?start_date=2022-05-01";

	// Create a new Application instance
	const proc = core.make("meeseOS/application", { args, options, metadata });

	// Create a new Window instance
	proc
		.createWindow({
			id: "UptimeMonitorWindow",
			title: metadata.title,
			icon: proc.resource(proc.metadata.icon),
			dimension: { width: 600, height: 450 },
			position: { left: 700, top: 200 },
		})
		.on("destroy", () => proc.destroy())
		.render(($content) => {
			const iframe = document.createElement("iframe");
			iframe.style.width = "100%";
			iframe.style.height = "100%";
			iframe.style.backgroundColor = "white";
			iframe.src = url;
			iframe.setAttribute("border", "0");
			$content.appendChild(iframe);
		});

	return proc;
};

// Creates the internal callback function when OS.js launches an application
meeseOS.register(applicationName, register);
