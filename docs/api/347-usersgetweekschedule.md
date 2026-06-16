# users.getWeekSchedule

> Source: https://developer.focus.teamleader.eu/docs/api/users-get-week-schedule

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Users](/docs/api/users)
  * users.getWeekSchedule



# users.getWeekSchedule
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/users.getWeekSchedule

Returns information about week schedule of a user. Only available with the _Weekly working schedule_ feature.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`87982c96-f2fe-4b05-838c-ff42c0525758`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**periods** object[]

  * Array [

**type** string

**Possible values:** [`working_hours`, `lunch_break`]

**Example:**`working_hours`

**start** object

**day** Weekday (string)

**Possible values:** [`monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`]

**time** string

The time of day in 24-hour hh:mm format. The time will be reported in the user's time zone.

**Example:**`09:00`

**end** object

**day** Weekday (string)

**Possible values:** [`monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`]

**time** string

The time of day in 24-hour hh:mm format. The time will be reported in the user's time zone.

**Example:**`17:00`

  * ]



    
    
    {  
      "data": {  
        "periods": [  
          {  
            "type": "working_hours",  
            "start": {  
              "day": "monday",  
              "time": "09:00"  
            },  
            "end": {  
              "day": "monday",  
              "time": "17:00"  
            }  
          }  
        ]  
      }  
    }  
    
    
    
    {  
      "data": {  
        "periods": [  
          {  
            "type": "working_hours",  
            "start": {  
              "day": "monday",  
              "time": "09:00"  
            },  
            "end": {  
              "day": "monday",  
              "time": "17:00"  
            }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/users.getWeekSchedule");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"87982c96-f2fe-4b05-838c-ff42c0525758\"\n}", null, "application/json");  
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
      "id": "87982c96-f2fe-4b05-838c-ff42c0525758"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
