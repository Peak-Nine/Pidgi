# projectGroups.delete

> Source: https://developer.focus.teamleader.eu/docs/api/project-groups-delete

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Groups](/docs/api/groups)
  * projectGroups.delete



# projectGroups.delete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projectGroups.delete

Delete a group.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`01866e6f-f264-7fe5-8b7c-a3f739fa292c`

**delete_strategy** stringrequired

**Possible values:** [`ungroup_tasks_and_materials`, `delete_tasks_and_materials`, `delete_tasks_materials_and_unbilled_timetrackings`]

**Example:**`ungroup_tasks_and_materials`




## Responses​

  * 204



**Response Headers**




#### Authorization: http
    
    
    **name:** [httpBearer](/docs/api/teamleader-api#authentication)**type:** http**scheme:** bearer

  * csharp
  * curl
  * dart
  * go
  * http
  * java
  * javascript
  * kotlin
  * c
  * nodejs
  * objective-c
  * ocaml
  * php
  * powershell
  * python
  * r
  * ruby
  * rust
  * shell
  * swift



  * HTTPCLIENT
  * RESTSHARP


    
    
    var client = new HttpClient();  
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projectGroups.delete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"01866e6f-f264-7fe5-8b7c-a3f739fa292c\",\n  \"delete_strategy\": \"ungroup_tasks_and_materials\"\n}", null, "application/json");  
    request.Content = content;  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Body required

  * Example (from schema)
  * Example


    
    
    {
      "id": "01866e6f-f264-7fe5-8b7c-a3f739fa292c",
      "delete_strategy": "ungroup_tasks_and_materials"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
