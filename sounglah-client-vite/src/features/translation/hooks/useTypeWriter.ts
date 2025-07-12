import { useEffect, useRef, useState } from 'react';

const useTypeWriter = (fullTranslatedText: string) => {
    const [displayedTranslation, setDisplayedTranslation] = useState<string>("");

        const currentIndexRef = useRef(0);
        const animationFrameIdRef = useRef<number | null>(null);
        const lastUpdateTimeRef = useRef(0);
        const fullTextRef = useRef(fullTranslatedText);
    
        const CHARS_PER_TICK = 1;
        const TIME_PER_CHAR_MS = 50;

    useEffect(() => {
		// --- Start of Effect for a new fullTranslatedText ---
		console.log(`EFFECT RUNNING for fullTranslatedText: "${fullTranslatedText}"`);

		fullTextRef.current = fullTranslatedText; // Ensure it's updated if fullTranslatedText itself changes

		// 1. Immediately clear any ongoing animation from a previous fullTranslatedText
		if (animationFrameIdRef.current !== null) {
			cancelAnimationFrame(animationFrameIdRef.current);
			animationFrameIdRef.current = null;
			console.log("Cancelled previous animation frame");
		}

		// 2. Reset state for the new animation sequence
		setDisplayedTranslation('');
		currentIndexRef.current = 0;
		lastUpdateTimeRef.current = 0;

		// 3. Define the animation function for *this* fullTranslatedText
		const typeCharacter = (timestamp: number) => {
			// Read from the ref to get the fullTranslatedText relevant to this animation sequence
			const currentFullText = fullTextRef.current;

			// If fullTranslatedText became empty/null while this animation was scheduled, stop.
			if (!currentFullText) {
				if (animationFrameIdRef.current !== null) {
					cancelAnimationFrame(animationFrameIdRef.current);
					animationFrameIdRef.current = null;
				}
				return;
			}

			if (!lastUpdateTimeRef.current) {
				lastUpdateTimeRef.current = timestamp;
			}

			const elapsed = timestamp - lastUpdateTimeRef.current;

			if (elapsed > TIME_PER_CHAR_MS) {
				// Check if we are already past the full length
				if (currentIndexRef.current >= currentFullText.length) {
					setDisplayedTranslation(currentFullText);
					if (animationFrameIdRef.current !== null) {
						cancelAnimationFrame(animationFrameIdRef.current);
						animationFrameIdRef.current = null;
					}
					return;
				}

				const charToAdd = currentFullText.substring(
					currentIndexRef.current,
					currentIndexRef.current + CHARS_PER_TICK
				);

				currentIndexRef.current += CHARS_PER_TICK; // Increment for the NEXT tick

				setDisplayedTranslation(prevDisplayedText => {
					// console.log(`prev: "${prevDisplayedText}", adding: "${charToAdd}"`);
					return prevDisplayedText + charToAdd;
				});

				lastUpdateTimeRef.current = timestamp;
			}

			// Schedule next frame if not done
			if (currentIndexRef.current < currentFullText.length) {
				animationFrameIdRef.current = requestAnimationFrame(typeCharacter);
			} else {
				// Animation is complete
				setDisplayedTranslation(currentFullText); // Ensure final text is set
				if (animationFrameIdRef.current !== null) {
					cancelAnimationFrame(animationFrameIdRef.current);
					animationFrameIdRef.current = null;
				}
			}
		};

		// 4. Start the animation if fullTranslatedText is present
		if (fullTextRef.current && fullTextRef.current.length > 0) {
			console.log(`Starting animation for: "${fullTextRef.current}"`);
			lastUpdateTimeRef.current = 0;
			animationFrameIdRef.current = requestAnimationFrame(typeCharacter);
		} else {
			setDisplayedTranslation(''); // Ensure display is empty if fullTranslatedText is empty
		}

		// 5. Cleanup function
		return () => {
			if (animationFrameIdRef.current !== null) {
				cancelAnimationFrame(animationFrameIdRef.current);
				animationFrameIdRef.current = null;
			}
		};
	}, [fullTranslatedText, CHARS_PER_TICK, TIME_PER_CHAR_MS]);

  return displayedTranslation;
};

export default useTypeWriter;
