# projects.delete

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-delete

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Projects](/docs/api/projects)
  * projects.delete



# projects.delete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projects.delete

Delete a project.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`81df9996-6d2c-4844-86d6-202c08d2837e`

**delete_strategy** stringrequired

**Possible values:** [`unlink_tasks_and_time_trackings`, `delete_tasks_and_time_trackings`, `delete_tasks_unlink_time_trackings`]

**Example:**`unlink_tasks_and_time_trackings`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projects.delete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"81df9996-6d2c-4844-86d6-202c08d2837e\",\n  \"delete_strategy\": \"unlink_tasks_and_time_trackings\"\n}", null, "application/json");  
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
      "id": "81df9996-6d2c-4844-86d6-202c08d2837e",
      "delete_strategy": "unlink_tasks_and_time_trackings"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
