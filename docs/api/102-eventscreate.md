# events.create

> Source: https://developer.focus.teamleader.eu/docs/api/events-create

  * [](/)
  * [API Reference](/docs/api)
  * Calendar
  * [Calendar events](/docs/api/calendar-events)
  * events.create



# events.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/events.create

Create a new calendar event.

## Request​

  * application/json



### Body**required**

**title** stringrequired

**Example:**`Meeting with stakeholders`

**description** string

**activity_type_id** stringrequired

**Example:**`b0a9ace5-fe82-4827-9d90-fc52f2c93050`

**starts_at** stringrequired

**Example:**`2016-02-04T16:00:00+00:00`

**ends_at** stringrequired

**Example:**`2016-02-04T18:00:00+00:00`

**location** string

**work_type_id** string

**Example:**`b37e2bc7-dea0-4fda-88e9-c092fb65667d`

**attendees** object[]

  * Array [

**type** stringrequired

**Possible values:** [`user`, `contact`]

**Example:**`user`

**id** stringrequired

**Example:**`6ddd2666-65a0-497f-9f01-54c4343ec1a6`

  * ]

**links** object[]

  * Array [

**id** stringrequired

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** stringrequired

**Possible values:** [`contact`, `company`, `deal`]

**Example:**`company`

  * ]




## Responses​

  * 201



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "type": "event",  
        "id": "9fc14045-5c6c-4ba8-8672-42ea3f26aa63"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "event",  
        "id": "9fc14045-5c6c-4ba8-8672-42ea3f26aa63"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/events.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"title\": \"Meeting with stakeholders\",\n  \"activity_type_id\": \"b0a9ace5-fe82-4827-9d90-fc52f2c93050\",\n  \"starts_at\": \"2016-02-04T16:00:00+00:00\",\n  \"ends_at\": \"2016-02-04T18:00:00+00:00\",\n  \"work_type_id\": \"b37e2bc7-dea0-4fda-88e9-c092fb65667d\",\n  \"attendees\": [\n    {\n      \"type\": \"user\",\n      \"id\": \"6ddd2666-65a0-497f-9f01-54c4343ec1a6\"\n    }\n  ],\n  \"links\": [\n    {\n      \"type\": \"company\",\n      \"id\": \"c9258836-f9a5-40cb-aa2a-d55c22991b93\"\n    }\n  ]\n}", null, "application/json");  
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
      "title": "Meeting with stakeholders",
      "activity_type_id": "b0a9ace5-fe82-4827-9d90-fc52f2c93050",
      "starts_at": "2016-02-04T16:00:00+00:00",
      "ends_at": "2016-02-04T18:00:00+00:00",
      "work_type_id": "b37e2bc7-dea0-4fda-88e9-c092fb65667d",
      "attendees": [
        {
          "type": "user",
          "id": "6ddd2666-65a0-497f-9f01-54c4343ec1a6"
        }
      ],
      "links": [
        {
          "type": "company",
          "id": "c9258836-f9a5-40cb-aa2a-d55c22991b93"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
