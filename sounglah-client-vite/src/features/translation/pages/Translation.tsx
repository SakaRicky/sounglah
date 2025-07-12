import { Title, Container, Text } from "@mantine/core";
import classes from './Translation.module.scss';
import { TranslationBox } from "../components/TranslationBox/TranslationBox";

function Translation() {
  return (
    <Container size="lg" className={classes.translationPage}>
      <div className={classes.header}>
        <Title ta="center" fz="3rem" fw="800" mb="md">
          SoungLah Translator
        </Title>
        <Text ta="center" c="dimmed" size="lg" mb="xl">
          Just give it a source text and choose the language you want it to be translated.
        </Text>
      </div>
      
      <div className={classes.translationContainer}>
        <TranslationBox />
      </div>
    </Container>
  );
}

export default Translation; 