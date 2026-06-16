# tasks.update

> Source: https://developer.focus.teamleader.eu/docs/api/tasks-update

  * [](/)
  * [API Reference](/docs/api)
  * Tasks
  * [Tasks](/docs/api/tasks)
  * tasks.update



# tasks.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/tasks.update

Update a task.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`00ed6266-a5bd-4aac-a292-2582017b6400`

**title** string

**description** string

**due_on** string

**Example:**`2016-02-04`

**work_type_id** string

**Example:**`32665afd-1818-0ed3-9e18-a603a3a21b95`

**milestone_id** stringnullable

Only available for users that have access to the old projects module

**Example:**`32665afd-1818-0ed3-9e18-a603a3a21b95`

**project_id** stringnullable

Only available for users that have access to the new projects module

**Example:**`0185aa33-603c-7fd5-bf0d-5bd83d503b96`

**deal_id** stringnullable

**Example:**`32665afd-1818-0ed3-9e18-a603a3a21b95`

**ticket_id** stringnullable

**Example:**`8607faa8-3d2e-0a66-a71e-e69f447a2ed1`

**estimated_duration** object

**unit** string

**Possible values:** [`min`]

**Example:**`min`

**value** number

**Example:**`60`

**assignee** objectnullable

Use null if the task is unassigned

**type** string

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** string

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

**customer** object

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**custom_fields** object[]

  * Array [

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * number
    * multiple selection
    * boolean
    * object

****string

For strings

**Example:**`092980616`

****number

For integer, number, money and auto-increment fields

**Example:**`123`

  * Array [

****string

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/tasks.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"00ed6266-a5bd-4aac-a292-2582017b6400\",\n  \"title\": \"string\",\n  \"description\": \"string\",\n  \"due_on\": \"2016-02-04\",\n  \"work_type_id\": \"32665afd-1818-0ed3-9e18-a603a3a21b95\",\n  \"milestone_id\": \"32665afd-1818-0ed3-9e18-a603a3a21b95\",\n  \"project_id\": \"0185aa33-603c-7fd5-bf0d-5bd83d503b96\",\n  \"deal_id\": \"32665afd-1818-0ed3-9e18-a603a3a21b95\",\n  \"ticket_id\": \"8607faa8-3d2e-0a66-a71e-e69f447a2ed1\",\n  \"estimated_duration\": {\n    \"unit\": \"min\",\n    \"value\": 60\n  },\n  \"assignee\": {\n    \"type\": \"user\",\n    \"id\": \"66abace2-62af-0836-a927-fe3f44b9b47b\"\n  },\n  \"customer\": {\n    \"type\": \"contact\",\n    \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\"\n  },\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ]\n}", null, "application/json");  
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
    
    
    {
      "id": "00ed6266-a5bd-4aac-a292-2582017b6400",
      "title": "string",
      "description": "string",
      "due_on": "2016-02-04",
      "work_type_id": "32665afd-1818-0ed3-9e18-a603a3a21b95",
      "milestone_id": "32665afd-1818-0ed3-9e18-a603a3a21b95",
      "project_id": "0185aa33-603c-7fd5-bf0d-5bd83d503b96",
      "deal_id": "32665afd-1818-0ed3-9e18-a603a3a21b95",
      "ticket_id": "8607faa8-3d2e-0a66-a71e-e69f447a2ed1",
      "estimated_duration": {
        "unit": "min",
        "value": 60
      },
      "assignee": {
        "type": "user",
        "id": "66abace2-62af-0836-a927-fe3f44b9b47b"
      },
      "customer": {
        "type": "contact",
        "id": "f29abf48-337d-44b4-aad4-585f5277a456"
      },
      "custom_fields": [
        {
          "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1",
          "value": "092980616"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
