import { getPreferenceValues } from "@raycast/api";
import * as azdev from "azure-devops-node-api";
import { compare, Operation } from "fast-json-patch";

import { Preferences } from "../types/Preferences";

const { organizationUrl, personalAccessToken: token, projectName, teamName } = getPreferenceValues<Preferences>();
const authHandler = azdev.getPersonalAccessTokenHandler(token);
const connection = new azdev.WebApi(organizationUrl, authHandler);

const GetGitApi = async () => await connection.getGitApi();
const GetWorkApi = async () => await connection.getWorkItemTrackingApi();

export const GetRepos = async () => {
  const api = await GetGitApi();
  const repos = await api.getRepositories();
  return repos;
};

export const CreatePullRequest = async (repoId: string, title: string, sourceBranch: string, targetBranch: string) => {
  try {
    const api = await GetGitApi();
    const prefix = "refs/heads/";
    return api.createPullRequest(
      {
        title,
        sourceRefName: prefix + sourceBranch,
        targetRefName: prefix + targetBranch,
      },
      repoId,
      projectName
    );
  } catch (err) {
    console.log(err);
  }
};

export const BuildPullRequestUrl = (repoName: string, pullRequestId: number) =>
  `${organizationUrl}/${projectName}/_git/${repoName}/pullrequest/${pullRequestId}`;

export const GetBranches = async (repoId: string) => {
  const api = await GetGitApi();
  return api.getBranches(repoId);
};

export const GetCommitDiffs = async (repoId: string, sourceBranch: string, targetBranch: string) => {
  const api = await GetGitApi();
  return api.getCommitDiffs(
    repoId,
    projectName,
    undefined,
    undefined,
    undefined,
    { baseVersion: sourceBranch },
    { targetVersion: targetBranch }
  );
};

export const GetRecentWorkItems = async () => {
  const allowedWorkItemTypes = ["feature", "epic", "userstory", "task", "bug"];

  const api = await GetWorkApi();
  const items = await api.getAccountMyWorkData();

  const filtered = items.workItemDetails?.filter((x) =>
    allowedWorkItemTypes.includes(x.workItemType?.toLowerCase().replace(" ", "") as unknown as string)
  );

  return filtered || [];
};

export const BuildWorkItemUrl = (workItemId: number) =>
  `${organizationUrl}/${projectName}/_workitems/edit/${workItemId}`;

export type CreateWorkItemPayload = {
  workItemType: "bug" | "user-story";
  title: string;
  iterationPath: string;
  description: string;
};
export const CreateWorkItem = async ({ title, iterationPath, workItemType, description }: CreateWorkItemPayload) => {
  const api = await GetWorkApi();

  const jsonPatch: Operation[] = [
    {
      op: "add",
      path: "/fields/System.AreaPath",
      // todo: make this a variable
      value: "tapio\\Tools-Materials\\Dev",
    },
    {
      op: "add",
      path: "/fields/" + (workItemType === "bug" ? "Microsoft.VSTS.TCM.ReproSteps" : "Custom.Description"),
      value: description,
    },
    {
      op: "add",
      path: "/fields/System.Title",
      value: title,
    },
    {
      op: "add",
      path: "/fields/System.IterationPath",
      value: iterationPath,
    },
  ];
  const item = await api.createWorkItem(undefined, jsonPatch, projectName, workItemType);
  return BuildWorkItemUrl(item.id!);
};

export const GetIterationPaths = async () => {
  const api = await connection.getWorkApi();
  const data = await api.getTeamIterations({ project: projectName, team: teamName });
  const upcomingIterations = data.filter((x) => x.attributes!.startDate! > new Date());
  return upcomingIterations;
};
