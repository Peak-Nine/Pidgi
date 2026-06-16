# reservations.list

> Source: https://developer.focus.teamleader.eu/docs/api/reservations-list

  * [](/)
  * [API Reference](/docs/api)
  * Planning
  * [Reservations](/docs/api/reservations)
  * reservations.list



# reservations.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/reservations.list

Lists all reservations that match the optional filters provided.

## Request​

  * application/json



### Body

**filter** object

**plannable_item_ids** string[]

**start_date** string

**Example:**`2024-01-11`

**end_date** string

**Example:**`2024-01-12`

**assignees** object[]

To fetch unassigned reservations, provide `null` instead of the type/id object

  * Array [

**type** stringrequired

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

  * ]

**sources** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** SourceType (string)

**Possible values:** [`call`, `closingDay`, `dayOffType`, `externalEvent`, `meeting`, `task`]

  * ]

**source_types** SourceType (string)[]

**Possible values:** [`call`, `closingDay`, `dayOffType`, `externalEvent`, `meeting`, `task`]

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`




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

**Example:**`39c64ba9-ebf1-491a-8486-a0b96ff21c07`

**plannable_item** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`plannableItem`

**date** string

**Example:**`2024-01-11`

**duration** object

**unit** string

**Possible values:** [`minutes`]

**Example:**`minutes`

**value** number

**Example:**`60`

**assignee** object

**type** stringrequired

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

**origin** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`dayOff`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "018d79a1-2b99-7fbd-b323-500b01305371",  
          "plannable_item": {  
            "type": "plannableItem",  
            "id": "46156648-87c6-478d-8aa7-1dc3a00dacab"  
          },  
          "date": "2024-01-02",  
          "duration": {  
            "value": 60,  
            "currency": "minutes"  
          },  
          "assignee": null,  
          "origin": null,  
          "source": {  
            "type": "task",  
            "id": "948b8ca5-58aa-0844-ba34-cee255aa9694"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "018d79a1-2b99-7fbd-b323-500b01305371",  
          "plannable_item": {  
            "type": "plannableItem",  
            "id": "46156648-87c6-478d-8aa7-1dc3a00dacab"  
          },  
          "date": "2024-01-02",  
          "duration": {  
            "value": 60,  
            "currency": "minutes"  
          },  
          "assignee": null,  
          "origin": null,  
          "source": {  
            "type": "task",  
            "id": "948b8ca5-58aa-0844-ba34-cee255aa9694"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/reservations.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"plannable_item_ids\": [\n    \"46156648-87c6-478d-8aa7-1dc3a00dacab\"\n  ]\n}", null, "application/json");  
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

  * Example (from schema)
  * Example


    
    
    {
      "plannable_item_ids": [
        "46156648-87c6-478d-8aa7-1dc3a00dacab"
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
