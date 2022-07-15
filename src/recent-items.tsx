import { ActionPanel, List, Action, Image } from "@raycast/api";
import { BuildWorkItemUrl, GetRecentWorkItems } from "./azure-devops/api";
import { useData } from "./common/useData";

const Icons: { [key: string]: string } = {
  bug: "bug-icon.png",
  task: "task-icon.png",
  userstory: "userstory-icon.png",
  feature: "feature-icon.png",
  epic: "epic-icon.png",
};

export default function Command() {
  const { data, isLoading } = useData(() => GetRecentWorkItems());

  return (
    <List enableFiltering={true} isLoading={isLoading}>
      {data?.map((x) => {
        return (
          <List.Item
            key={x.id}
            icon={{
              source: Icons[x.workItemType!.toLowerCase().replace(" ", "")],
              mask: Image.Mask.Circle,
            }}
            title={x.title!}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={BuildWorkItemUrl(x.id!)} />
                {/* <Action.Push title="Set Hours" target={} /> */}
                {/* <Action onAction={} title="Change State" /> */}
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}