using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.IO;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.SpaServices;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddHttpClient("AzureProxy");

// Service and CORS configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5205")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors();
app.UseRouting();
app.UseAuthorization();

app.MapRazorPages();


app.Use(async (context, next) =>
{
    if (context.Request.Path.Value?.StartsWith("/api", StringComparison.OrdinalIgnoreCase) == true)
    {
        var httpClientFactory = context.RequestServices.GetRequiredService<IHttpClientFactory>();
        var httpClient = httpClientFactory.CreateClient("AzureProxy");

        var targetUrl = $"https://pechangatesthemaiya.azurewebsites.net{context.Request.Path}{context.Request.QueryString}";
        var requestMessage = new HttpRequestMessage(new HttpMethod(context.Request.Method), targetUrl);

        
        if (!HttpMethods.IsGet(context.Request.Method) &&
            !HttpMethods.IsHead(context.Request.Method) &&
            !HttpMethods.IsDelete(context.Request.Method))
        {
            context.Request.EnableBuffering();
            var streamContent = new StreamContent(context.Request.Body);
            requestMessage.Content = streamContent;
        }

        foreach (var header in context.Request.Headers)
        {
            if (header.Key.Equals("Host", StringComparison.OrdinalIgnoreCase) ||
                header.Key.Equals("Cookie", StringComparison.OrdinalIgnoreCase)) 
                continue;

            if (header.Key.StartsWith("Content-", StringComparison.OrdinalIgnoreCase))
            {
                if (requestMessage.Content != null)
                {
                    requestMessage.Content.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                }
            }
            else
            {
                requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }

        requestMessage.Headers.Host = "pechangatesthemaiya.azurewebsites.net";

      
        string freshLiveCookie = "ARRAffinity=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; ARRAffinitySameSite=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; .AspNetCore.Antiforgery.cdV5uW_Ejgc=CfDJ8LbtibfgVHBJjONX366BUVnCKTD6pV2dPJZyFiElAxPWLmmf_bFf5Mw-rnRcvXWULVl0jqWm3ITzkbMob9bg2SHIdCt_4exPDY6873MdP1WFzrmMxxtAM9xHaFlx1gzOIoF8vMPeOI_c3aliOOrvA8k; .AspNetCore.Cookies=CfDJ8LbtibfgVHBJjONX366BUVng2JPAd9AWbA8IDlHEJ2UyynZJuZ3DIo-oxT2ZBXN7F0aViWW6g_lgABRGJ42kymoF7vfnn3qe5ivQPmWRng40H13LLeC3-g-5ADvyFJwQpjnwb_4gEvZd6Pz3Y5q5QfgZVmddOBOtzQVYvQSRpc0UgtOxDIfl1O4MSo5ZBrUmqcllWbt8kWaWeIi-_x1dROhkegl9KOqmN9PLJouFDFhjJJY__cc3FcRmZWmKTjhqXt7XHahSQxB046P0o7BS1JcHrnqg_8ZSc0-pexy8MUZX6ZOP-7GhBszkjqqIUlQveqMvhMg2r8YM21CPyE0PwHJp13gOj-eMPS0ZplnbGUPXvQVhaQnpDoWDB77M3Q8YVTTd27eGrUJGt5sDVSK28yezZi5f8QfUjwEVV6-9NxDUOOzofxM1Nxm7G11WBaUID6e_yIpj-pkRKbACZrK04Ov15lURww2KwfEQ_KBv1kJwDa85cw8chtqUleAGw_a2YEowf5VyVcmS3nFlVla-pmL2ctY5Qi-SFazzwt2JfioD2_2-8r7R-p-7B-q80MVxK7rLxZM_uNWMAZZzKvrKuOXWDsWNLo6Sekf7Ghx8ORfO1CF-98scp3czMsPgTlBsN5XTOGFZBZv0Zf61Hy7uoHNrca6E33kqld9EOZ73nF3cz9TQ44LbUrZGNRnyN2SmnCcO6m_JVj0Z61vd5BDn53c-9aCSXYk5gJj7vqQslFBTT5vzILkeKFqxgkSwSVvwd9CTgz_zAly7If57-QJS_MktcyUfZ3kNPAVhUyWCC2ctLHiO1M1j7BQABkxRLMj31FJRVr6YSasfalJ5gHxCRl1Bw6Z6GusRcI1N55ZISIbs3xM1cUqXVw9m1kAqUN5g48a_jdaJAgfJ1Cu_ml6Z760op4M6PFKyUXiU-FN1fL8H3cZ_VAVdM_1jnltvQmlZXQkcmpC1JDoAujnWhbbH_624yxspTSy8DNGbUnCZDIT2OO1VbFPOA7GFQWFCJuPIjnSIzJ0L2xcKXy8lKYj8qnDYqYzxZIsFqupU5529yqxt32ftfRGfNUCz33k4oikTUq-cPRoh8Ph0qtglJnm_gPU-Uqk9Co04MIRfpLCoCDG_xPxAmgUB1LvOMplCToxhDx8T8MEFODRPJg4tAGxJo03RYwCsFwuf1WdDtyQy6tbv_KhyuE1vkzMCWMEwp0b3lLcKEKJExShKgvdBc1TiFj-hsQLipY1BbHkQfcjW3L0ClTVKXkOA99eTZCwcC6dI3NEz9d--0xQZMOTyXM49DgSgwnfDRHBvYEdz7lzJ11emQQAeOQl7rW9_UUFg9_KVBy659fD1IU5QZxEi_Y_NPfy8dId8mJoHCiPUHBUeyBmqJtDmerYzCfEmLbjiSJybuEQarudb2C7GiXBBnuvzfiv6ePp3V3zDnWvtzLwWqTZjH-gm1pPBda0cWlsZUx4Id003TP5uV9IX-MFmUzDgebFSnWFgAdJAG6zyDWk5HVsrQDDqzXXzQm3ltGxx_hpEr7zMJnETjM8P4u_3lei2ITo9l3jO4Kn-3y1lrFpA82k2dH9a6GS3imB0hyFsORCLc-btb8Zi8ANKNHlXrvDZWtSbWEZdjs0Gzl1kuFQ4MYssr8HfdnbsfoQOuUax3nrVvsdTUdGWBOM_N6dCb6q8q7_hbLFQ5o5mRt3SxSMW96dw07Vjh9YHSzi2WIZQsNgRBswcJVUHovnBLH6iy3IltHH4_aprm4e0z4tGLIMTEtfh3EoqR5HHAaFnoXAir-u6VBMRItSEsRXPNn_M4GcGS8KCcC4qX5sGOc3PNkzFd-yEB_t0vD6QbPXlrEgRaxlmWuBJD9GaWwf4-Cn8tHfs8bRKSaR0MxUCu_Hh83W_CCDWO1YVGHvbtTuJ_Tu89YUuH2zgV5SUks7VwQkTydio1TX9EVA5r_UUXi6vyKtzacwuHKhCFMd5Cde0NWWbh51kZOy8NVN-iJOmlE6c8g8pNMurzGMPCsYeS2PhwKADUdJM7eIeeDG9tbuTFASIPZKZ23cJqI8bxuHnRktS9LVhnnhxVI5mz8-k_JaLeVb2AykDzaMBKd2_KD0mZRS6rC9sj-Ld50qt_qSAznczd-AXq6-BoakQ0gweU7B7YUFetwbH2tYxGYfv1PpIGAK1hFRPKs42m2riMmVCafgpvQpbxI4FSEbhPOT-XZ5KLEsd8a0nv6KnhB85jUColhyW6yGOrGwlGFARXwji2LKv0bIFPKR_EQIl7W6gsSY9SmtktcoRw2V7vywNnkmOrLBPrAFaML6H33f5gC1uUlE2WFBIrPZFlQNwxMPkNnw5tFyFnFo4QbvtFJLXZEZHZv5mo1CNM14WGcJj1RZXruTrwb8Rn3o; .AspNetCore.Session=CfDJ8LbtibfgVHBJjONX366BUVnQ8epYqY3SbqT7oIT97kRuSEVGjLUBXvEC20vV1hEP1r1W2oyunQJ2cRui%2BX3mbjau4bu1ZF%2FB8o467AFGwk%2BaJLjscPZcMzJqO0dLFycppvZQCtaIXSMMq3OI5AHjM30R%2FC0X5%2FE%2BSn5AIzDuB7gy";

        requestMessage.Headers.TryAddWithoutValidation("Cookie", freshLiveCookie);

        var responseMessage = await httpClient.SendAsync(requestMessage);

        context.Response.StatusCode = (int)responseMessage.StatusCode;

        foreach (var header in responseMessage.Headers)
        {
            if (!header.Key.Equals("Transfer-Encoding", StringComparison.OrdinalIgnoreCase) &&
                !header.Key.Equals("Connection", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }
        }

        foreach (var header in responseMessage.Content.Headers)
        {
            context.Response.Headers[header.Key] = header.Value.ToArray();
        }

        await responseMessage.Content.CopyToAsync(context.Response.Body);
        return;
    }

    await next();
});


app.MapWhen(context => context.Request.Path.StartsWithSegments("/admin"), adminApp =>
{
    adminApp.UseStaticFiles();

    adminApp.UseSpa(spa =>
    {
        if (app.Environment.IsDevelopment())
        {
        
            spa.UseProxyToSpaDevelopmentServer("http://localhost:54080");
        }
        else
        {
            spa.Options.SourcePath = "wwwroot/admin";
        }
    });
});

app.MapFallbackToFile("admin/index.html");

app.Run();