# meetings.info

> Source: https://developer.focus.teamleader.eu/docs/api/meetings-info

  * [](/)
  * [API Reference](/docs/api)
  * Calendar
  * [Meetings](/docs/api/meetings)
  * meetings.info



# meetings.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/meetings.info

Get information about a meeting.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`70af3fdd-b037-0936-ad1a-6d784dd44cf4`

**includes** string

when used, the response will include `tracked_time`

**Example:**`tracked_time`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)



**Schema**

**data** object

**id** string

**Example:**`70af3fdd-b037-0936-ad1a-6d784dd44cf4`

**title** string

**Example:**`My meeting`

**description** string

**Example:**`My meeting description`

**created_at** string

**Example:**`2020-02-01T10:33:45+00:00`

**scheduled_at** string

**Example:**`2020-02-04T16:44:33+00:00`

**duration** object

**unit** string

**Possible values:** [`min`]

**Example:**`min`

**value** number

**Example:**`60`

**tracked_time** object

Only included with request parameter `includes=tracked_time`

**total** object

**value** number

**Example:**`60`

**unit** string

**Possible values:** [`min`]

**Example:**`min`

**estimated_time** object

Only included with request parameter `includes=estimated_time`

**total** object

**value** number

**Example:**`60`

**unit** string

**Possible values:** [`s`]

**Example:**`s`

**customer** objectnullable

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**project** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`project`, `nextgenProject`]

**Example:**`project`

**milestone** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**group** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**deal** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**location** object

oneOf

    * With type string
    * With type & address
    * With id, type & address

**type** string

**Possible values:** [`virtual`, `calendarResource`]

**Example:**`virtual`

**type** string

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**address** object

**line_1** stringnullable

**Example:**`Dok Noord 3A 101`

**postal_code** stringnullable

**Example:**`9000`

**city** stringnullable

**Example:**`Ghent`

**country** string

**Example:**`BE`

**area_level_two** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`area_level_two`

**type** string

**Example:**`customLocation`

**id** string

**Example:**`4191c526-5e26-0818-8e16-9523215b5081`

**address** object

**line_1** stringnullable

**Example:**`Dok Noord 3A 101`

**postal_code** stringnullable

**Example:**`9000`

**city** stringnullable

**Example:**`Ghent`

**country** string

**Example:**`BE`

**area_level_two** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`area_level_two`

**online_meeting_room** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**attendees** object[]

  * Array [

**type** string

**Possible values:** [`user`, `contact`]

**Example:**`user`

**id** string

**Example:**`6ddd2666-65a0-497f-9f01-54c4343ec1a6`

  * ]

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

**status** string

**Possible values:** [`open`, `done`]

**recurrence** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**workOrder** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "id": "70af3fdd-b037-0936-ad1a-6d784dd44cf4",  
        "title": "My meeting",  
        "description": "My meeting description",  
        "created_at": "2020-02-01T10:33:45+00:00",  
        "scheduled_at": "2020-02-04T16:44:33+00:00",  
        "duration": {  
          "unit": "min",  
          "value": 60  
        },  
        "tracked_time": {  
          "total": {  
            "value": 60,  
            "unit": "min"  
          }  
        },  
        "estimated_time": {  
          "total": {  
            "value": 60,  
            "unit": "s"  
          }  
        },  
        "customer": {  
          "type": "contact",  
          "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
        },  
        "project": {  
          "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
          "type": "project"  
        },  
        "milestone": {  
          "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
          "type": "string"  
        },  
        "group": {  
          "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
          "type": "string"  
        },  
        "deal": {  
          "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
          "type": "string"  
        },  
        "location": {  
          "type": "virtual"  
        },  
        "online_meeting_room": {  
          "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
          "type": "string"  
        },  
        "attendees": [  
          {  
            "type": "user",  
            "id": "6ddd2666-65a0-497f-9f01-54c4343ec1a6"  
          }  
        ],  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ],  
        "status": "open",  
        "recurrence": {  
          "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
          "type": "string"  
        },  
        "workOrder": {  
          "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
          "type": "string"  
        }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/meetings.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"70af3fdd-b037-0936-ad1a-6d784dd44cf4\",\n  \"includes\": \"tracked_time\"\n}", null, "application/json");  
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
      "id": "70af3fdd-b037-0936-ad1a-6d784dd44cf4",
      "includes": "tracked_time"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
