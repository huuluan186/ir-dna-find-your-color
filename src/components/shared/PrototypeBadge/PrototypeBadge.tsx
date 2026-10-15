import { Badge } from "@mantine/core";
import classes from "./PrototypeBadge.module.css";

export function PrototypeBadge() {
	return (
		<Badge className={classes.badge} title="Bản mẫu" aria-label="Bản mẫu">
			P
		</Badge>
	);
}
