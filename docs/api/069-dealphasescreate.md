# dealPhases.create

> Source: https://developer.focus.teamleader.eu/docs/api/deal-phases-create

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deal Phases](/docs/api/deal-phases)
  * dealPhases.create



# dealPhases.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dealPhases.create

Create a new deal phase.

## Request​

  * application/json



### Body**required**

**name** stringrequired

**Example:**`Investigation`

**deal_pipeline_id** stringrequired

**Example:**`f350e48a-fbc3-0a79-e62a-53aa1ae86d44`

**requires_attention_after** objectrequired

Time period after which a deal requires attention

**amount** numberrequired

**Example:**`7`

**unit** stringrequired

**Possible values:** [`days`, `weeks`]

**Example:**`days`

**estimated_probability** number

**Example:**`0.5`

**follow_up_actions** FollowUpActions (string)[]

**Possible values:** [`create_event`, `create_call`, `create_task`]




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
        "type": "dealPhase",  
        "id": "22364cbf-971e-022c-811b-a76c28000257"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "dealPhase",  
        "id": "22364cbf-971e-022c-811b-a76c28000257"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dealPhases.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"name\": \"Investigation\",\n  \"deal_pipeline_id\": \"f350e48a-fbc3-0a79-e62a-53aa1ae86d44\",\n  \"requires_attention_after\": {\n    \"amount\": 7,\n    \"unit\": \"days\"\n  },\n  \"estimated_probability\": 0.5,\n  \"follow_up_actions\": [\n    \"create_event\"\n  ]\n}", null, "application/json");  
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
      "name": "Investigation",
      "deal_pipeline_id": "f350e48a-fbc3-0a79-e62a-53aa1ae86d44",
      "requires_attention_after": {
        "amount": 7,
        "unit": "days"
      },
      "estimated_probability": 0.5,
      "follow_up_actions": [
        "create_event"
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
