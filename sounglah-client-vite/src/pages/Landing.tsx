import { Title, Text, Container } from "@mantine/core";
import classes from './Landing.module.scss';
import Hero from "./Hero";

function Landing() {

  return (
    <div className={classes.landingPage}>
      <div className={classes.heroSection}>
        <Hero />
        <Container size="lg">
          <Title ta="center" fz="4rem" fw="800" mb="lg">
            Welcome to SoungLah
          </Title>
          <Text ta="center" size="xl" c="dimmed" mb="xl">
            Your AI-powered translation companion
          </Text>
          <Text size="lg" className={classes.description}>
            Break down language barriers with our advanced translation technology.
            Translate text between multiple languages with ease and accuracy.
          </Text>

        </Container>
      </div>

      <div className={classes.featuresSection}>
        <Container size="lg">
          <Title ta="center" fz="2.5rem" fw="700" mb="xl">
            Why Choose SoungLah?
          </Title>

          <div className={classes.featuresGrid}>
            <div className={classes.feature}>
              <Title order={3} mb="md">AI-Powered</Title>
              <Text>Advanced machine learning models for accurate translations</Text>
            </div>

            <div className={classes.feature}>
              <Title order={3} mb="md">Multiple Languages</Title>
              <Text>Support for a wide range of languages and dialects</Text>
            </div>

            <div className={classes.feature}>
              <Title order={3} mb="md">Fast & Reliable</Title>
              <Text>Quick translations with high accuracy and reliability</Text>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default Landing; 