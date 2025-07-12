import { Box } from '@mantine/core';
import heroImage from "@/assets/images/sounglah-hero-image.webp";
import classes from "./Hero.module.scss";

const Hero = () => {

    return <Box my="md" className={`${classes.container} ${classes.root}`}>
            <Box className={classes.heroText}>
                <h1 className={classes.title}>Celebrate African Voices.<br />
                    Discover Language.<br />
                    Embrace Culture.
                </h1>
                <p>Learn African languages, explore diverse cultures, and connect with a vibrant global community.</p>
                <Box className={classes.cta}>
                    <a className={classes.primary} href='#'>Start Learning</a>
                    <a className={classes.secondary} href='#'>Explore cultures</a>
                </Box>
            </Box>
            <Box className={classes.illustration}>
                <img
                    src={heroImage}
                    alt="People celebrating African culture"
                    loading="lazy"
                    style={{ backgroundColor: "inherit" }}
                />
            </Box>
        </Box>
}

export default Hero
