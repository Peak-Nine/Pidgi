# events.list

> Source: https://developer.focus.teamleader.eu/docs/api/events-list

  * [](/)
  * [API Reference](/docs/api)
  * Calendar
  * [Calendar events](/docs/api/calendar-events)
  * events.list



# events.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/events.list

Get a list of calendar events.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**user_id** string

**Example:**`5309c8c9-e313-47b0-90ba-6850c3dc3e33`

**activity_type_id** string

**Example:**`edd94120-63e2-4b10-80ed-fdfcfaa0a515`

**ends_after** string

Start of the period for which to return events

**Example:**`2017-01-01T00:00:00+00:00`

**starts_before** string

End of the period for which to return events

**Example:**`2018-01-01T00:00:00+00:00`

**term** string

Searches for a term in title or description

**Example:**`coffee`

**attendee** object

**type** stringrequired

**Possible values:** [`contact`]

**Example:**`contact`

**id** stringrequired

**Example:**`2659dc4d-444b-4ced-b51c-b87591f604d7`

**link** object

**id** stringrequired

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** stringrequired

**Possible values:** [`contact`, `company`, `deal`]

**Example:**`contact`

**task_id** string

**Example:**`5309c8c9-e313-47b0-90ba-6850c3dc3e33`

**done** boolean

**Example:**`false`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`starts_at`]

**Default value:**`starts_at`

**order** Order (string)

**Possible values:** [`asc`, `desc`]

**Default value:**`asc`

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

**Example:**`6d64488c-75d8-4de9-b140-2555566fa27d`

**creator** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**task** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**activity_type** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**title** string

**Example:**`Erlich Bachman's birthday`

**description** string

**starts_at** string

**Example:**`2016-02-04T16:00:00+00:00`

**ends_at** string

**Example:**`2016-02-04T18:00:00+00:00`

**location** string

**attendees** object[]

  * Array [

**type** string

**Possible values:** [`user`, `contact`]

**Example:**`user`

**id** string

**Example:**`6ddd2666-65a0-497f-9f01-54c4343ec1a6`

  * ]

**links** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`contact`, `company`, `deal`]

**Example:**`contact`

  * ]

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "6d64488c-75d8-4de9-b140-2555566fa27d",  
          "creator": {  
            "type": "user",  
            "id": "e51d1a0e-452e-4d5d-a2a1-2c8f75dde560"  
          },  
          "task": {  
            "type": "task",  
            "id": "eb399573-e1ae-4377-bbaf-34358eb19831"  
          },  
          "activity_type": {  
            "type": "activityType",  
            "id": "28158af3-2ef3-4178-ac8b-2542b1481af0"  
          },  
          "title": "Erlich Bachman's birthday",  
          "description": "",  
          "starts_at": "2016-02-04T16:00:00+00:00",  
          "ends_at": "2016-02-04T18:00:00+00:00",  
          "location": "",  
          "attendees": [  
            {  
              "type": "contact",  
              "id": "8b3afad7-648d-4b4c-b38b-5726d3222282"  
            }  
          ],  
          "links": [  
            {  
              "type": "company",  
              "id": "c9258836-f9a5-40cb-aa2a-d55c22991b93"  
            }  
          ]  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "6d64488c-75d8-4de9-b140-2555566fa27d",  
          "creator": {  
            "type": "user",  
            "id": "e51d1a0e-452e-4d5d-a2a1-2c8f75dde560"  
          },  
          "task": {  
            "type": "task",  
            "id": "eb399573-e1ae-4377-bbaf-34358eb19831"  
          },  
          "activity_type": {  
            "type": "activityType",  
            "id": "28158af3-2ef3-4178-ac8b-2542b1481af0"  
          },  
          "title": "Erlich Bachman's birthday",  
          "description": "",  
          "starts_at": "2016-02-04T16:00:00+00:00",  
          "ends_at": "2016-02-04T18:00:00+00:00",  
          "location": "",  
          "attendees": [  
            {  
              "type": "contact",  
              "id": "8b3afad7-648d-4b4c-b38b-5726d3222282"  
            }  
          ],  
          "links": [  
            {  
              "type": "company",  
              "id": "c9258836-f9a5-40cb-aa2a-d55c22991b93"  
            }  
          ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/events.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"string\"\n    ],\n    \"user_id\": \"5309c8c9-e313-47b0-90ba-6850c3dc3e33\",\n    \"activity_type_id\": \"edd94120-63e2-4b10-80ed-fdfcfaa0a515\",\n    \"ends_after\": \"2017-01-01T00:00:00+00:00\",\n    \"starts_before\": \"2018-01-01T00:00:00+00:00\",\n    \"term\": \"coffee\",\n    \"attendee\": {\n      \"type\": \"contact\",\n      \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n    },\n    \"link\": {\n      \"id\": \"eab232c6-49b2-4b7e-a977-5e1148dad471\",\n      \"type\": \"contact\"\n    },\n    \"task_id\": \"5309c8c9-e313-47b0-90ba-6850c3dc3e33\",\n    \"done\": false\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"starts_at\",\n      \"order\": \"asc\"\n    }\n  ]\n}", null, "application/json");  
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
        "user_id": "5309c8c9-e313-47b0-90ba-6850c3dc3e33",
        "activity_type_id": "edd94120-63e2-4b10-80ed-fdfcfaa0a515",
        "ends_after": "2017-01-01T00:00:00+00:00",
        "starts_before": "2018-01-01T00:00:00+00:00",
        "term": "coffee",
        "attendee": {
          "type": "contact",
          "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
        },
        "link": {
          "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",
          "type": "contact"
        },
        "task_id": "5309c8c9-e313-47b0-90ba-6850c3dc3e33",
        "done": false
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "starts_at",
          "order": "asc"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
