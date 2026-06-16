# tasks.list

> Source: https://developer.focus.teamleader.eu/docs/api/tasks-list

  * [](/)
  * [API Reference](/docs/api)
  * Tasks
  * [Tasks](/docs/api/tasks)
  * tasks.list



# tasks.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/tasks.list

Get a list of tasks.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**user_id** stringnullable

Returns tasks that are assigned to this user or to a team to which this user belongs. When passing `null`, it returns tasks that are unassigned.

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**milestone_id** string

**Example:**`32665afd-1818-0ed3-9e18-a603a3a21b95`

**completed** boolean

**Example:**`true`

**scheduled** boolean

**Example:**`true`

**due_by** string

**Example:**`2019-02-04`

**due_from** string

**Example:**`2019-10-20`

**term** string

Searches for a term in the description.

**Example:**`website design`

**customer** object

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`name`]

**Example:**`name`

**order** Order (string)

**Possible values:** [`asc`, `desc`]

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

**id** string

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**title** string

**Example:**`Review code changes`

**description** string

**completed** boolean

**Example:**`false`

**completed_at** stringnullable

**Example:**`2016-02-04T16:44:33+00:00`

**due_on** string

**Example:**`2016-02-04`

**added_at** stringnullable

**Example:**`2016-02-04T16:44:33+00:00`

**estimated_duration** object

**unit** string

**Possible values:** [`min`]

**Example:**`min`

**value** number

**Example:**`60`

**work_type** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**assignee** objectnullable

Null if the task is unassigned

**type** string

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** string

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

**customer** objectnullable

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**milestone** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**deal** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**project** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**ticket** objectnullable

**id** stringrequired

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`ticket`

**priority** Priority (string)

**Possible values:** [`A`, `B`, `C`, `D`]

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "f29abf48-337d-44b4-aad4-585f5277a456",  
          "title": "Review code changes",  
          "description": "",  
          "completed": false,  
          "completed_at": "2016-02-04T16:44:33+00:00",  
          "due_on": "2016-02-04",  
          "added_at": "2016-02-04T16:44:33+00:00",  
          "estimated_duration": {  
            "unit": "min",  
            "value": 60  
          },  
          "work_type": {  
            "type": "workType",  
            "id": "32665afd-1818-0ed3-9e18-a603a3a21b95"  
          },  
          "assignee": {  
            "type": "user",  
            "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
          },  
          "customer": {  
            "type": "contact",  
            "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
          },  
          "milestone": {  
            "type": "milestone",  
            "id": "32665afd-1818-0ed3-9e18-a603a3a21b95"  
          },  
          "deal": {  
            "type": "deal",  
            "id": "32665afd-1818-0ed3-9e18-a603a3a21b95"  
          },  
          "project": {  
            "type": "project",  
            "id": "bbbb772b-e7ad-06c5-935c-b0f6ef61d6bc"  
          },  
          "ticket": {  
            "type": "ticket",  
            "id": "8607faa8-3d2e-0a66-a71e-e69f447a2ed1"  
          },  
          "priority": "A"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "f29abf48-337d-44b4-aad4-585f5277a456",  
          "title": "Review code changes",  
          "description": "",  
          "completed": false,  
          "completed_at": "2016-02-04T16:44:33+00:00",  
          "due_on": "2016-02-04",  
          "added_at": "2016-02-04T16:44:33+00:00",  
          "estimated_duration": {  
            "unit": "min",  
            "value": 60  
          },  
          "work_type": {  
            "type": "workType",  
            "id": "32665afd-1818-0ed3-9e18-a603a3a21b95"  
          },  
          "assignee": {  
            "type": "user",  
            "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
          },  
          "customer": {  
            "type": "contact",  
            "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
          },  
          "milestone": {  
            "type": "milestone",  
            "id": "32665afd-1818-0ed3-9e18-a603a3a21b95"  
          },  
          "deal": {  
            "type": "deal",  
            "id": "32665afd-1818-0ed3-9e18-a603a3a21b95"  
          },  
          "project": {  
            "type": "project",  
            "id": "bbbb772b-e7ad-06c5-935c-b0f6ef61d6bc"  
          },  
          "ticket": {  
            "type": "ticket",  
            "id": "8607faa8-3d2e-0a66-a71e-e69f447a2ed1"  
          },  
          "priority": "A"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/tasks.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"string\"\n    ],\n    \"user_id\": \"f29abf48-337d-44b4-aad4-585f5277a456\",\n    \"milestone_id\": \"32665afd-1818-0ed3-9e18-a603a3a21b95\",\n    \"completed\": true,\n    \"scheduled\": true,\n    \"due_by\": \"2019-02-04\",\n    \"due_from\": \"2019-10-20\",\n    \"term\": \"website design\",\n    \"customer\": {\n      \"type\": \"contact\",\n      \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\"\n    }\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"name\",\n      \"order\": \"asc\"\n    }\n  ]\n}", null, "application/json");  
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

Body
    
    
    {
      "filter": {
        "ids": [
          "string"
        ],
        "user_id": "f29abf48-337d-44b4-aad4-585f5277a456",
        "milestone_id": "32665afd-1818-0ed3-9e18-a603a3a21b95",
        "completed": true,
        "scheduled": true,
        "due_by": "2019-02-04",
        "due_from": "2019-10-20",
        "term": "website design",
        "customer": {
          "type": "contact",
          "id": "f29abf48-337d-44b4-aad4-585f5277a456"
        }
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "name",
          "order": "asc"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
