# projectGroups.update

> Source: https://developer.focus.teamleader.eu/docs/api/project-groups-update

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Groups](/docs/api/groups)
  * projectGroups.update



# projectGroups.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projectGroups.update

Update a group. All attributes except for `id` are optional. Providing `null` will clear that value from the project (for properties that are nullable).

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`e8478f2c-05a1-4e69-b3c4-e08507640f01`

**title** string

**Example:**`My updated group`

**description** stringnullable

If `null`, the description is cleared.

**Example:**`I updated this group because I felt like it`

**color** Color (string)

**Possible values:** [`#00B2B2`, `#008A8C`, `#992600`, `#ED9E00`, `#D157D3`, `#A400B2`, `#0071F2`, `#004DA6`, `#64788F`, `#C0C0C4`, `#82828C`, `#1A1C20`]

**Example:**`#00B2B2`

**billing_method** object

**value** stringrequired

**Possible values:** [`time_and_materials`, `fixed_price`, `parent_fixed_price`, `non_billable`]

**Example:**`time_and_materials`

**update_strategy** stringrequired

**Possible values:** [`none`, `cascade`]

**Example:**`none`

**fixed_price** objectnullable

Only allowed if the billing_method is fixed_price, or the group is already fixed_price.

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget** objectnullable

Also known as "budget". Value set by user to compare with price. Only allowed if the billing_method is time_and_materials, or the group is already time_and_materials.

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**internal_budget** objectnullable

"cost budget". Value set by user to compare with cost.

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**start_date** stringnullable

**Example:**`2023-01-18`

**end_date** stringnullable

**Example:**`2023-03-22`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projectGroups.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"e8478f2c-05a1-4e69-b3c4-e08507640f01\",\n  \"title\": \"My updated group\",\n  \"description\": \"I updated this group because I felt like it\",\n  \"color\": \"#00B2B2\",\n  \"billing_method\": {\n    \"value\": \"time_and_materials\",\n    \"update_strategy\": \"none\"\n  },\n  \"fixed_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"external_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"internal_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"start_date\": \"2023-01-18\",\n  \"end_date\": \"2023-03-22\"\n}", null, "application/json");  
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
      "id": "e8478f2c-05a1-4e69-b3c4-e08507640f01",
      "title": "My updated group",
      "description": "I updated this group because I felt like it",
      "color": "#00B2B2",
      "billing_method": {
        "value": "time_and_materials",
        "update_strategy": "none"
      },
      "fixed_price": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "external_budget": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "internal_budget": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "start_date": "2023-01-18",
      "end_date": "2023-03-22"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
