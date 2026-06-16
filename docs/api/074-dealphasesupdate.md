# dealPhases.update

> Source: https://developer.focus.teamleader.eu/docs/api/deal-phases-update

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deal Phases](/docs/api/deal-phases)
  * dealPhases.update



# dealPhases.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dealPhases.update

Update a deal phase.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`22364cbf-971e-022c-811b-a76c28000257`

**name** string

**Example:**`Preparation`

**requires_attention_after** objectrequired

Time period after which a deal requires attention

**amount** numberrequired

**Example:**`7`

**unit** stringrequired

**Possible values:** [`days`, `weeks`]

**Example:**`days`

**estimated_probability** number

**Example:**`0.8`

**follow_up_actions** FollowUpActions (string)[]

**Possible values:** [`create_event`, `create_call`, `create_task`]




## Responses​

  * 204



**Response Headers**




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dealPhases.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"22364cbf-971e-022c-811b-a76c28000257\",\n  \"name\": \"Preparation\",\n  \"requires_attention_after\": {\n    \"amount\": 7,\n    \"unit\": \"days\"\n  },\n  \"estimated_probability\": 0.8,\n  \"follow_up_actions\": [\n    \"create_event\"\n  ]\n}", null, "application/json");  
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
      "id": "22364cbf-971e-022c-811b-a76c28000257",
      "name": "Preparation",
      "requires_attention_after": {
        "amount": 7,
        "unit": "days"
      },
      "estimated_probability": 0.8,
      "follow_up_actions": [
        "create_event"
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
