import { useState, useEffect } from "react";
import { ActionPanel, Detail, List, Action, Form, showToast, Toast, Clipboard, popToRoot, closeMainWindow, Image } from "@raycast/api";
import { BuildPullRequestUrl, CreatePullRequest, GetBranches, GetRepos } from "./azure-devops/api";
import { GitRepository } from "azure-devops-node-api/interfaces/GitInterfaces";
import { useData } from "./common/useData";

export default function Command() {
  const { data: repos, isLoading } = useData(() => GetRepos());

  return (
    <List isLoading={isLoading} enableFiltering={true} >
      {repos?.map((repo) => (
        <List.Item
          icon={{
            source: "https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png",
            mask: Image.Mask.Circle
          }}
          title={repo.name || ""}
          actions={
            <ActionPanel>
              <Action.Push title="Show Details" target={<PullRequestForm repo={repo} /> } />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

const PullRequestForm: React.FC<{ repo: GitRepository }> = ({ repo }) => {
  const { data: branches, isLoading} = useData(() => GetBranches(repo.id!));
  const { length, [length -1]: defaultBranchName  }: { length: number } & { [key: number]: string } = repo.defaultBranch?.split("/") as string[] || ["master"];

  const onCreatePr = async (values: { sourceBranch: string, targetBranch: string, name: string }) => {
    const toast = await showToast({ title: "Creating PR...", style: Toast.Style.Animated,  });
    const prResult = await CreatePullRequest(repo.id!, values.name, values.sourceBranch, values.targetBranch);
    toast.style = Toast.Style.Success;
    toast.message = "Successfully Created PR";

    await Clipboard.copy(BuildPullRequestUrl(repo.name!, prResult?.pullRequestId!));
    await closeMainWindow();
    await popToRoot();
  }

  return (
    <Form isLoading={isLoading} actions={
      <ActionPanel>
        <Action.SubmitForm onSubmit={onCreatePr} title="Create PR" />
      </ActionPanel>
    }>
      <Form.Dropdown id="sourceBranch" title="Source Branch">
          {branches?.filter(x => x.name && x.name !== "master").sort((a, b) => a.aheadCount! - b.aheadCount!).map((branch) => (
            <Form.Dropdown.Item key={"source-" +branch.name} value={branch.name || ""}  title={branch.name || ""} />
          ))}
      </Form.Dropdown>
      <Form.Dropdown id="targetBranch" title="Target Branch" defaultValue={defaultBranchName}>
          {branches?.filter(x => x.name).map((branch) => (
            <Form.Dropdown.Item key={"target-" + branch.name} value={branch.name || ""}  title={branch.name || ""} />
          ))}
      </Form.Dropdown>
      <Form.Separator />
      <Form.TextField id="name" title="PR Title" />
    </Form>
  )
}
