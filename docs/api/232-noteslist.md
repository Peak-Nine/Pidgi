# notes.list

> Source: https://developer.focus.teamleader.eu/docs/api/notes-list

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Notes](/docs/api/notes)
  * notes.list



# notes.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/notes.list

Get a list of all notes.

## Request​

  * application/json;charset=utf-8



### Body**required**

**filter** objectrequired

**subject** objectrequired

**id** stringrequired

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** NoteSubjectTypes (string)required

**Possible values:** [`company`, `contact`, `creditNote`, `deal`, `invoice`, `nextgenProject`, `product`, `project`, `quotation`, `subscription`]

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`




## Responses​

  * 200



**Response Headers**




  * application/json;charset=utf-8



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**id** string

**Example:**`a344c251-2494-0013-b433-ccee8e8435e5`

**content** string

**Example:**`new note content`

**subject** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** NoteSubjectTypes (string)

**Possible values:** [`company`, `contact`, `creditNote`, `deal`, `invoice`, `nextgenProject`, `product`, `project`, `quotation`, `subscription`]

**added_at** string

**Example:**`2016-01-01T00:00:00+00:00`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "a344c251-2494-0013-b433-ccee8e8435e5",  
          "content": "new note content",  
          "subject": {  
            "type": "contact",  
            "id": "36386b05-936e-4cc0-9523-bd20d797ebf5"  
          },  
          "added_at": "2016-01-01T00:00:00+00:00"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "a344c251-2494-0013-b433-ccee8e8435e5",  
          "content": "new note content",  
          "subject": {  
            "type": "contact",  
            "id": "36386b05-936e-4cc0-9523-bd20d797ebf5"  
          },  
          "added_at": "2016-01-01T00:00:00+00:00"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/notes.list");  
    request.Headers.Add("Accept", "application/json;charset=utf-8");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("", null, "application/json;charset=utf-8");  
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


    
    
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
