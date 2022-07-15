import { ActionPanel, Action, Form, open, showToast, popToRoot } from "@raycast/api";
import { CreateWorkItem, CreateWorkItemPayload, GetIterationPaths } from "./azure-devops/api";
import { ConvertMarkdownToHtml } from "./common/ConvertMarkdownToHtml";
import { useData } from "./common/useData";

export default function Command() {
  const { data: iterations } = useData(() => GetIterationPaths());

  const onSubmit = async (data: CreateWorkItemPayload) => {
    await showToast({ title: "Creating Work Item..." });
    data.description = ConvertMarkdownToHtml(data.description);

    const itemUrl = await CreateWorkItem(data);
    await open(itemUrl);
    await popToRoot({ clearSearchBar: true })
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={onSubmit} title="Create Item" />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="workItemType" title="Work Item Type">
        <Form.Dropdown.Item title="Bug" value="bug" />
        <Form.Dropdown.Item title="User Story" value="User Story" />
      </Form.Dropdown>

      <Form.Dropdown id="iterationPath" title="Iteration Path">
        {iterations?.map((iteration) => (
          <Form.Dropdown.Item key={iteration.path} value={iteration.path || ""} title={iteration.name || ""} />
        ))}
      </Form.Dropdown>

      <Form.TextField id="title" title="Title" />
      <Form.TextArea id="description" enableMarkdown={true} title="Description" info="You can use markdown here"  />
    </Form>
  );
}
