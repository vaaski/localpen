import prompts from "prompts"
import { type Template, templates } from "./constants"

export const templatePrompt = async () => {
  const prompt = await prompts({
    type: "select",
    name: "template",
    message: "Select a template",
    choices: templates.map((t) => ({
      title: t.color(t.name),
      value: t,
    })),
  })

  return prompt.template as Template
}
