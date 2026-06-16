# projectLines.list

> Source: https://developer.focus.teamleader.eu/docs/api/project-lines-list

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Project lines](/docs/api/project-lines)
  * projectLines.list



# projectLines.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projectLines.list

All line types (tasks, materials, groups) can be side-loaded.

## Request​

  * application/json



### Body**required**

**project_id** stringrequired

**Example:**`49b403be-a32e-0901-9b1c-25214f9027c6`

**filter** object

**types** string[]

**Possible values:** [`nextgenTask`, `nextgenMaterial`, `nextgenProjectGroup`]

**assignees** object[]

To fetch unassigned lines, provide `null` instead of the type/id object

  * Array [

**type** stringrequired

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

  * ]




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**line** object

**type** string

**Possible values:** [`nextgenTask`, `nextgenMaterial`, `nextgenProjectGroup`]

**Example:**`nextgenMaterial`

**id** string

**Example:**`a14a464d-320a-49bb-b6ee-b510c7f4f66c`

**group** objectnullable

If null, this line is not a part of a group.

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`nextgenProjectGroup`

  * ]



    
    
    {  
      "data": [  
        {  
          "line": {  
            "type": "nextgenMaterial",  
            "id": "a14a464d-320a-49bb-b6ee-b510c7f4f66c"  
          },  
          "group": {  
            "type": "nextgenProjectGroup",  
            "id": "a14a464d-320a-49bb-b6ee-b510c7f4f66c"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "line": {  
            "type": "nextgenMaterial",  
            "id": "a14a464d-320a-49bb-b6ee-b510c7f4f66c"  
          },  
          "group": {  
            "type": "nextgenProjectGroup",  
            "id": "a14a464d-320a-49bb-b6ee-b510c7f4f66c"  
          }  
        }  
      ]  
    }  
    

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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projectLines.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"project_id\": \"49b403be-a32e-0901-9b1c-25214f9027c6\",\n  \"filter\": {\n    \"types\": [\n      \"nextgenTask\",\n      \"nextgenMaterial\",\n      \"nextgenProjectGroup\"\n    ],\n    \"assignees\": [\n      {\n        \"type\": \"user\",\n        \"id\": \"66abace2-62af-0836-a927-fe3f44b9b47b\"\n      }\n    ]\n  }\n}", null, "application/json");  
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
      "project_id": "49b403be-a32e-0901-9b1c-25214f9027c6",
      "filter": {
        "types": [
          "nextgenTask",
          "nextgenMaterial",
          "nextgenProjectGroup"
        ],
        "assignees": [
          {
            "type": "user",
            "id": "66abace2-62af-0836-a927-fe3f44b9b47b"
          }
        ]
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
