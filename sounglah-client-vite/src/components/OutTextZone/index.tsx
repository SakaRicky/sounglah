import { Paper } from "@mantine/core";
import classes from './OutTextZone.module.scss';

export interface OutputTextZoneProps {
	translated?: string;
}

export const OutTextZone = ({
	translated,
}: OutputTextZoneProps) => { 
	return (
		<Paper
			shadow="xl"
			radius="md"
			p="md"
			className={classes.root}
		>
			<h5 style={{ fontSize: "1.5rem" }}>Medumba</h5>
			<div className={classes.translatedTextArea}>{translated}</div>
		</Paper>
	);
};