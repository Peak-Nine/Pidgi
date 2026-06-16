# Tasks

> Source: https://developer.focus.teamleader.eu/docs/api/projects-v-2-tasks

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * Tasks



# Tasks

> _These endpoints are for (new) project tasks. For documentation on endpoints for tasks not linked to a project, see**Tasks** below._

_**Required scopes:**_ `projects`

## [📄️ tasks.listLists all the tasks that match the optional filters provided.](/docs/api/nextgen-projects-tasks-list)## [📄️ tasks.infoReturns all the information for one task.](/docs/api/nextgen-projects-tasks-info)## [📄️ tasks.createCreate a task. All properties except for `title` and `project_id` are optional.](/docs/api/nextgen-projects-tasks-create)## [📄️ tasks.updateUpdate a task. All attributes except for `id` are optional. Providing `null` will clear that value from the project (for properties that are nullable).](/docs/api/nextgen-projects-tasks-update)## [📄️ tasks.duplicateDuplicate a task, without its time trackings.](/docs/api/nextgen-projects-tasks-duplicate)## [📄️ tasks.deleteDelete a task.](/docs/api/nextgen-projects-tasks-delete)## [📄️ tasks.assignAssign a user or a team to a task.](/docs/api/nextgen-projects-tasks-assign)## [📄️ tasks.unassignUnassign a user or a team from a task.](/docs/api/nextgen-projects-tasks-unassign)
