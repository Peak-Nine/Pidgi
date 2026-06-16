# calls.info

> Source: https://developer.focus.teamleader.eu/docs/api/calls-info

  * [](/)
  * [API Reference](/docs/api)
  * Calendar
  * [Calls](/docs/api/calls)
  * calls.info



# calls.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/calls.info

Get information about a call.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`6fac0bf0-e803-424e-af67-76863a3d7d16`




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

**Example:**`32665afd-1818-0ed3-9e18-a603a3a21b95`

**added_at** stringnullable

**Example:**`2016-02-01T16:44:33+00:00`

**completed_at** stringnullable

**Example:**`2016-02-04T16:44:33+00:00`

**participant** objectnullable

**customer** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**contact** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**description** stringnullable

**Example:**`Description of the call`

**outcome** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**outcome_summary** stringnullable

**Example:**`Called, but was not available`

**assignee** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**scheduled_at** string

**Example:**`2016-02-04T16:00:00+00:00`

**status** string

**Possible values:** [`open`, `completed`]

**Example:**`open`

**deal** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

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



    
    
    {  
      "data": {  
        "id": "32665afd-1818-0ed3-9e18-a603a3a21b95",  
        "added_at": "2016-02-01T16:44:33+00:00",  
        "completed_at": "2016-02-04T16:44:33+00:00",  
        "participant": {  
          "customer": {  
            "type": "company",  
            "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
          },  
          "contact": {  
            "type": "contact",  
            "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
          }  
        },  
        "description": "Description of the call",  
        "outcome": {  
          "type": "callOutcome",  
          "id": "32665afd-1818-0ed3-9e18-a603a3a21b95"  
        },  
        "outcome_summary": "Called, but was not available",  
        "assignee": {  
          "type": "user",  
          "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
        },  
        "scheduled_at": "2016-02-04T16:00:00+00:00",  
        "status": "open",  
        "deal": {  
          "id": "f29abf48-337d-44b4-aad4-585f5277a456",  
          "type": "deal"  
        },  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ]  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "32665afd-1818-0ed3-9e18-a603a3a21b95",  
        "added_at": "2016-02-01T16:44:33+00:00",  
        "completed_at": "2016-02-04T16:44:33+00:00",  
        "participant": {  
          "customer": {  
            "type": "company",  
            "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
          },  
          "contact": {  
            "type": "contact",  
            "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
          }  
        },  
        "description": "Description of the call",  
        "outcome": {  
          "type": "callOutcome",  
          "id": "32665afd-1818-0ed3-9e18-a603a3a21b95"  
        },  
        "outcome_summary": "Called, but was not available",  
        "assignee": {  
          "type": "user",  
          "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
        },  
        "scheduled_at": "2016-02-04T16:00:00+00:00",  
        "status": "open",  
        "deal": {  
          "id": "f29abf48-337d-44b4-aad4-585f5277a456",  
          "type": "deal"  
        },  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/calls.info");  
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
