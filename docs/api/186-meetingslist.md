# meetings.list

> Source: https://developer.focus.teamleader.eu/docs/api/meetings-list

  * [](/)
  * [API Reference](/docs/api)
  * Calendar
  * [Meetings](/docs/api/meetings)
  * meetings.list



# meetings.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/meetings.list

Get a list of meetings.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**employee_id** string

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**start_date** string

**Example:**`2019-02-04`

**end_date** string

**Example:**`2019-02-04`

**milestone_id** string

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**term** string

**Example:**`funny joke HR meeting`

**recurrence_id** string

**Example:**`1dfccc8e-68d0-0b83-8d1b-5cf1b0d99ab1`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`scheduled_at`]

**Default value:**`scheduled_at`

**order** Order (string)

**Possible values:** [`asc`, `desc`]

**Default value:**`asc`

  * ]

**includes** string

when used, the response will include `tracked_time`

**Example:**`tracked_time`




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

**attendees** object[]

  * Array [

**type** string

**Possible values:** [`user`, `contact`]

**Example:**`user`

**id** string

**Example:**`6ddd2666-65a0-497f-9f01-54c4343ec1a6`

  * ]

**status** string

**Possible values:** [`open`, `done`]

**recurrence** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "f29abf48-337d-44b4-aad4-585f5277a456",  
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
              "unit": "min",  
              "value": 60  
            }  
          },  
          "estimated_time": {  
            "total": {  
              "unit": "min",  
              "value": 60  
            }  
          },  
          "customer": {  
            "type": "contact",  
            "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
          },  
          "project": {  
            "type": "project",  
            "id": "bbbb772b-e7ad-06c5-935c-b0f6ef61d6bc"  
          },  
          "milestone": {  
            "type": "milestone",  
            "id": "bb8337d9-e669-0319-aa57-355ef6ff4f2d"  
          },  
          "attendees": [  
            {  
              "type": "user",  
              "id": "b5094b3f-bb7a-0391-b01b-e709773f3509"  
            }  
          ],  
          "status": "open",  
          "recurrence": {  
            "type": "recurrence",  
            "id": "1dfccc8e-68d0-0b83-8d1b-5cf1b0d99ab1"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "f29abf48-337d-44b4-aad4-585f5277a456",  
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
              "unit": "min",  
              "value": 60  
            }  
          },  
          "estimated_time": {  
            "total": {  
              "unit": "s",  
              "value": 60  
            }  
          },  
          "customer": {  
            "type": "contact",  
            "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
          },  
          "project": {  
            "type": "project",  
            "id": "bbbb772b-e7ad-06c5-935c-b0f6ef61d6bc"  
          },  
          "milestone": {  
            "type": "milestone",  
            "id": "bb8337d9-e669-0319-aa57-355ef6ff4f2d"  
          },  
          "attendees": [  
            {  
              "type": "user",  
              "id": "b5094b3f-bb7a-0391-b01b-e709773f3509"  
            }  
          ],  
          "status": "open",  
          "recurrence": {  
            "type": "recurrence",  
            "id": "1dfccc8e-68d0-0b83-8d1b-5cf1b0d99ab1"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/meetings.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"string\"\n    ],\n    \"employee_id\": \"f29abf48-337d-44b4-aad4-585f5277a456\",\n    \"start_date\": \"2019-02-04\",\n    \"end_date\": \"2019-02-04\",\n    \"milestone_id\": \"f29abf48-337d-44b4-aad4-585f5277a456\",\n    \"term\": \"funny joke HR meeting\",\n    \"recurrence_id\": \"1dfccc8e-68d0-0b83-8d1b-5cf1b0d99ab1\"\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"scheduled_at\",\n      \"order\": \"asc\"\n    }\n  ],\n  \"includes\": \"tracked_time\"\n}", null, "application/json");  
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
        "employee_id": "f29abf48-337d-44b4-aad4-585f5277a456",
        "start_date": "2019-02-04",
        "end_date": "2019-02-04",
        "milestone_id": "f29abf48-337d-44b4-aad4-585f5277a456",
        "term": "funny joke HR meeting",
        "recurrence_id": "1dfccc8e-68d0-0b83-8d1b-5cf1b0d99ab1"
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "scheduled_at",
          "order": "asc"
        }
      ],
      "includes": "tracked_time"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
