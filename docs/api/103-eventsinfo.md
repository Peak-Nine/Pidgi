# events.info

> Source: https://developer.focus.teamleader.eu/docs/api/events-info

  * [](/)
  * [API Reference](/docs/api)
  * Calendar
  * [Calendar events](/docs/api/calendar-events)
  * events.info



# events.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/events.info

Get details for a single calendar event.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`9a5a3984-abfc-40cd-a880-f97683c6a99c`




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

**Example:**`9a5a3984-abfc-40cd-a880-f97683c6a99c`

**title** string

**Example:**`Meeting with stakeholders`

**description** string

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

**Possible values:** [`contact`, `company`, `work_order`, `deal`]

**Example:**`company`

  * ]



    
    
    {  
      "data": {  
        "id": "9a5a3984-abfc-40cd-a880-f97683c6a99c",  
        "title": "Meeting with stakeholders",  
        "description": "",  
        "creator": {  
          "type": "user",  
          "id": "6f45600a-4402-40e0-9dcc-7665384bcd48"  
        },  
        "task": {  
          "type": "task",  
          "id": "be80d753-f2ee-426d-9596-2a2e1a23a82e"  
        },  
        "activity_type": {  
          "type": "activityType",  
          "id": "4a1b1d8e-45da-4c5f-a986-3f93d174d352"  
        },  
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
    }  
    
    
    
    {  
      "data": {  
        "id": "9a5a3984-abfc-40cd-a880-f97683c6a99c",  
        "title": "Meeting with stakeholders",  
        "description": "",  
        "creator": {  
          "type": "user",  
          "id": "6f45600a-4402-40e0-9dcc-7665384bcd48"  
        },  
        "task": {  
          "type": "task",  
          "id": "be80d753-f2ee-426d-9596-2a2e1a23a82e"  
        },  
        "activity_type": {  
          "type": "activityType",  
          "id": "4a1b1d8e-45da-4c5f-a986-3f93d174d352"  
        },  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/events.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"9a5a3984-abfc-40cd-a880-f97683c6a99c\"\n}", null, "application/json");  
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
      "id": "9a5a3984-abfc-40cd-a880-f97683c6a99c"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
