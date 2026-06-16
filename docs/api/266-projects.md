# Projects

> Source: https://developer.focus.teamleader.eu/docs/api/projects

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * Projects



# Projects

> _This is the documentation of the new projects module. See the**Legacy Projects** documentation for the endpoints concerning our legacy projects module._

> ⚠️ (July 2023) The projects module has been completely overhauled and is currently only available for new project users. Existing project users only have access to the old projects module.

> Over the course of the next few months, next generation projects will also be made available to existing project users, including the migration of existing project data.

> To avoid naming collisions, all endpoints of the new projects module can be found under `/projects-v2`, for example `/projects-v2/projects.list`.

> To avoid confusing "new projects" with "creating a new project", we opted for "projects-v2" over "new" as the prefix.

_**Required scopes:**_ `projects`

## [📄️ projects.listLists all projects that match the optional filters provided.](/docs/api/nextgen-projects-list)## [📄️ projects.infoReturns all the information of a single project.](/docs/api/nextgen-projects-info)## [📄️ projects.createCreate a new project. Only `title` is required. All the other fields are optional.](/docs/api/nextgen-projects-create)## [📄️ projects.updateUpdate a project. All attributes except for `id` are optional. Providing `null` will clear that value from the project (for properties that are nullable).](/docs/api/nextgen-projects-update)## [📄️ projects.closeMark a project as closed.](/docs/api/nextgen-projects-close)## [📄️ projects.reopenReopen a closed project.](/docs/api/nextgen-projects-reopen)## [📄️ projects.duplicateDuplicate a project.](/docs/api/nextgen-projects-duplicate)## [📄️ projects.deleteDelete a project.](/docs/api/nextgen-projects-delete)## [📄️ projects.addOwnerAdd a user as owner. Doesn't fail if the user was already added.](/docs/api/nextgen-projects-add-owner)## [📄️ projects.removeOwnerRemove a user as owner. Doesn't fail if the user wasn't linked.](/docs/api/nextgen-projects-remove-owner)## [📄️ projects.assignAssign a user or a team to a project.](/docs/api/nextgen-projects-assign)## [📄️ projects.unassignUnassign a user or a team from a project.](/docs/api/nextgen-projects-unassign)## [📄️ projects.addCustomerAdd a customer to the project. Doesn't fail if the customer was already added.](/docs/api/nextgen-projects-add-customer)## [📄️ projects.removeCustomerRemove a customer from the project. Doesn't fail if the customer was not added.](/docs/api/nextgen-projects-remove-customer)## [📄️ projects.addDealAdd a deal to the project. Doesn't fail if the deal was already added.](/docs/api/nextgen-projects-add-deal)## [📄️ projects.removeDealRemove a deal from the project. Doesn't fail if the deal was already removed.](/docs/api/nextgen-projects-remove-deal)## [📄️ projects.addQuotationAdd a quotation to the project. Doesn't fail if the quotation was already added.](/docs/api/nextgen-projects-add-quotation)## [📄️ projects.removeQuotationRemove a quotation from the project. Doesn't fail if the quotation was already removed.](/docs/api/nextgen-projects-remove-quotation)
