import { useEditLink } from "rspress/theme";


export const EditOnGithub = () => {
  const editLinkObj = useEditLink();

  if (!editLinkObj) {
    return null;
  }

  const { text, link } = editLinkObj;

  <a href={link} target="_blank" >
    {text}
  </a>;
};