# tasks.info

> Source: https://developer.focus.teamleader.eu/docs/api/tasks-info

  * [](/)
  * [API Reference](/docs/api)
  * Tasks
  * [Tasks](/docs/api/tasks)
  * tasks.info



# tasks.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/tasks.info

Get information about a task.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`ff19a113-50ba-4afc-9fff-2e5c5c5a5485`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`6fac0bf0-e803-424e-af67-76863a3d7d16`

**title** string

**Example:**`Review code changes`

**description** string

**completed** boolean

**Example:**`false`

**completed_at** stringnullable

**Example:**`2016-02-04T16:44:33+00:00`

**due_on** string

**Example:**`2016-02-04`

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

**custom_fields** object[]

  * Array [

**definition** object

**type** string

**Example:**`customFieldDefinition`

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * numbers
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

For multiple selection fields

**Example:**`foo`

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

For related Teamleader objects

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]

**priority** Priority (string)

**Possible values:** [`A`, `B`, `C`, `D`]



    
    
    {  
      "data": {  
        "id": "6fac0bf0-e803-424e-af67-76863a3d7d16",  
        "title": "Review code changes",  
        "description": "",  
        "completed": false,  
        "completed_at": "2016-02-04T16:44:33+00:00",  
        "due_on": "2016-02-04",  
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
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ],  
        "priority": "A"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "6fac0bf0-e803-424e-af67-76863a3d7d16",  
        "title": "Review code changes",  
        "description": "",  
        "completed": false,  
        "completed_at": "2016-02-04T16:44:33+00:00",  
        "due_on": "2016-02-04",  
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
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ],  
        "priority": "A"  
      }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/tasks.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"6fac0bf0-e803-424e-af67-76863a3d7d16\"\n}", null, "application/json");  
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
      "id": "6fac0bf0-e803-424e-af67-76863a3d7d16"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
