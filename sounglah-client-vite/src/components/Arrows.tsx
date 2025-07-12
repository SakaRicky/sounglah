
export const ArrowDownIcon = ({ size = "3rem" }) => (
	<svg
	  xmlns="http://www.w3.org/2000/svg"
	  viewBox="0 0 24 24"
	  width={size}
	  height={size}
	  style={{ transform: 'rotate(90deg)' }}  // rotate right-facing arrow downward
	>
	  <path
		d="m18.707 12.707-3 3a1 1 0 0 1-1.414-1.414L15.586 13H6a1 1 0 0 1 0-2h9.586l-1.293-1.293a1 1 0 0 1 1.414-1.414l3 3a1 1 0 0 1 0 1.414z"
		style={{ fill: '#f97c4b' }}
		data-name="Right"
	  />
	</svg>
  );

export const RightArrow = ({ size = "4rem" }) => {
	return (
		<svg 
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width={size}
			height={size}>
			<path
				d="m18.707 12.707-3 3a1 1 0 0 1-1.414-1.414L15.586 13H6a1 1 0 0 1 0-2h9.586l-1.293-1.293a1 1 0 0 1 1.414-1.414l3 3a1 1 0 0 1 0 1.414z"
				style={{ fill: '#f97c4b' }}
				data-name="Right"
			/>
		</svg>
	);
};
