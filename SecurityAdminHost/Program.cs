using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Service and CORS configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:54080", "http://localhost:5205")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddRazorPages();
builder.Services.AddSpaStaticFiles(options =>
{
    options.RootPath = "../securityadmin/dist";
});

// HttpClient configuration without automatic cookies
builder.Services.AddHttpClient("AzureProxy")
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        UseCookies = false,
        AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
    });

var app = builder.Build();

app.UseStaticFiles();
app.UseCors();
app.UseRouting();

// Reverse proxy middleware
app.Use(async (context, next) =>
{
    if (context.Request.Path.Value?.StartsWith("/api", StringComparison.OrdinalIgnoreCase) == true)
    {
        var httpClientFactory = context.RequestServices.GetRequiredService<IHttpClientFactory>();
        var httpClient = httpClientFactory.CreateClient("AzureProxy");

        var targetUrl = $"https://pechangatesthemaiya.azurewebsites.net{context.Request.Path}{context.Request.QueryString}";
        var requestMessage = new HttpRequestMessage(new HttpMethod(context.Request.Method), targetUrl);

        // Copy request body for non-GET requests
        if (context.Request.Method != "GET" && context.Request.Method != "HEAD")
        {
            requestMessage.Content = new StreamContent(context.Request.Body);
        }

        // Copy headers except Host and Cookie
        foreach (var header in context.Request.Headers)
        {
            if (header.Key.Equals("Host", StringComparison.OrdinalIgnoreCase) ||
                header.Key.Equals("Cookie", StringComparison.OrdinalIgnoreCase))
                continue;

            if (header.Key.StartsWith("Content-", StringComparison.OrdinalIgnoreCase) && requestMessage.Content != null)
                requestMessage.Content.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            else
                requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
        }

        requestMessage.Headers.Host = "pechangatesthemaiya.azurewebsites.net";

        // Custom cookie injection
        string freshLiveCookie = "ARRAffinity=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; ARRAffinitySameSite=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; .AspNetCore.Antiforgery.cdV5uW_Ejgc=CfDJ8LbtibfgVHBJjONX366BUVm2i-YMzrfsKboLXidJMQrRDXV_V34CBzKqKyQhwvUKNTfeldDbTyCzl8lopVr9jjOMUsVGUrXAssEhOILivaKarw7JRprlLBnP5FJCB7z5VoNjdU7G5K_N_E71pT4uIIY; .AspNetCore.Session=CfDJ8LbtibfgVHBJjONX366BUVkbQ%2B3fnya5HDVfjFZqRCO%2BvKqP1M6gjHuQcoq4WQFz07NtFkDR%2BeWUgyHCT9EyrwRdPf8XXVKvwP%2FDoRWTt8IGOi4xDdzgbHGovH0GS%2B8%2B6cQ7hS7G%2BX%2FRCZowkj5ubtuK3Ff0TQpW%2FBShDdCdgtbv; .AspNetCore.Cookies=CfDJ8LbtibfgVHBJjONX366BUVkzh78bMFfOuRXieor37CGiHArfDKQXndFYCvhGhGp_W5QlcUsZkXGMlfK4bF7SiopefT2RDPuUPF3GusoCwEqn2TLNgHM4jXvxeoaM_nZ9JBqWzq_zz17RwFHI2Yr7YH5NK8TOoGt5_yWfh-OHRxv-mLiwDrTYH7VgN2kdbU8Lyzi1MOLdQvsUDAdc_narSRwHectzPGOoN5kqaDquD-cLS09SVCU8TqtxOoGgipCd33ved9qW3qmGhi7z2xSt7Plw5DrO_skR1nwFv1qphmieUzfycxisj_er4XAW-WlS4KMvQaF5svMfoMOWEjSy2JeS-oa4aWllDhF9SFe5keVOqWbTzNnNJqExEQc1_vqgdIhAvLO1olxi169GH3OOoDH3avyIiuaKbzjFODJ4gSiMWRe69PdhNzYDJC3tUuTiF4y9gKigjofVlNs-mbRbFHB8ly4n0euT9TBXq1drKbvYo18txDSXpvCLbcUTVzu3lUoH0qaplaudTBJP_fqjnKP6YV1V7zaSmDg8IA73fVxOoKlXWxUeAwlq39U2eHp4avE4mCjd8dyM-hk2-pANyyPht2pGR-shBHaw5WOuiM7GppRtAX2m5l-ywL01gu0Twil6UtvC0L3ILMLjX2Cg9TGZwKoH6oYHywZDtxzcHhU6dCpAqV1ZRemzdcgptXRNaK0qBewCoHnJQp6zY1c-7LMcSNypco7p5ENtxxwpdxDCMKz4RuPDFu60NeyMjbxDdrQG9FqpOIorozqOwFFoYMBj60NnT5SkiMkZiSMN9EWmpjhndnk1JL1qAqAh0IZqX3lTNd4bhEHJEZy_4A3X57DXMDXoJmJa8mcG5tf7KIJ_gMCFCmnpaPjbkEGngn9CUktS-L3DIQpklw9oM7nhfcuA1p0esvobNFA5Ib2FT-Q7HpWaKYDW2yMK4w-wKE9M6awFEChbep2BjHp4mQyanMsMNg3zifisWQ1tCuVHcdVEN6jgbA7Q00KIIhspMc4-sFNdBq8IUC6uV-QgGarOzpUIv2RZUHANZ9IxvBNIk3GR3rhqDCd2AOw1-xwgbIVoViJN-7ujL3OU7P08_RD3xfP8wH2dJolW30QLmiEWEHqyEXbKVjAwCViuDjNnkt1fuDphcOJ4k7IW1WPe8e3zo8DfIQJRXfEliEsNzh5GqKEFhkkNO8OfksfyQmjrv0_gswf4FnVRXo7hCvL3QE7K9RwNH3RvkvgFFLvRrvt0qkOTaDwByG5P8z9LqYsWiezxIXsGg3-amd1Ruw_IjThmYiOwPaJk94z3_QMbiYSLwxpUnkDEakh6LOaXZax1wKFbWhPVIcktV2fVtikZ8RtqoDSO1_1r9LgEqZYioN8E7fUVe1l0Nakan9tI894SK5pl7DLHoVpGXcDjFMxBAF-kKjHK5ixIn4cRem6wLjAmbF-gEy1VWUEgfrfZ8QYxSdbLGhQiTuFC71o2DYtV2U34dLt8nNjO8epLRnDD79eDx7SxNeWy5VUToVkK3yo9KEORtzXlSPf7vSA9Vsu478ZNZa51kMQjqMm43plQWxQCcSl7r1f47Nn16xFrlaRHArmX0I80Yi7F6W-6seNnvNYiiXDBZmSbgzQs0utXeSMaNglDSFnsbpgUPqL0LjN2bbs_N6SikgSY3OF6a9EfUbUvIhGYzDlpNKewM9woAMlYbcezIB1pt2509h1p5NFi3rZ4OT4jFK1QyxGNcUR7a2g-n95Mb3nF7wmWbBLbzikcFOBN-b64O19yEfEWalKJJwRfcX_OdkC07Zm9BC_-8Z385QQP_XEGnaF19IPAnDsGM50RDYr-W_8cljl3H3MK57TUvP3KUH-dbC0YRQlUlMqmL-udc0xvrSk41OAAG7m5Gux6MW-LVAlno2zbfdcypSYLgfpnV68NkmkTO51Mh7FtMZSIf54b_aWnRkZQyI0y5-rG3LS4s5guoK3_AAYAjn9kYcHJKjltPPStEhjSfjdCswCwlG5cgNKqjNnXyeNMuAEQfx-_ClXdmAq-csOYzxRTeiItO_DFBr3bcHqqkAOVOrvOml0CYCrOwki-xO91BXZ3K3ObafOVQ3tUA469aGuhbrkvCNOFHM3VIlZA1Q5FMQJv5b9Atwwx_5-UilvKIM_6pt-GDwNMwv64aTBtWD103GH3nNZ1OIe7h1n25AROiDFRrwYUtcHP3QIrmARDNa-LHW4WGnvw2yz_ByBoJgrToSpcHGZhA29B2dEwkbdk2VoKBG8CzOYzKIUw9nsyLzIePrk0lNd1z4UTIb23WFN2ix2AsTwTnlPuRPwyntPYwt9-k82K32VYhjlkHwor-NJEBBhWBMZesvRIoSLMbYpemXD3Ml3o8pU5zVfT7ZBE5YI";

        requestMessage.Headers.TryAddWithoutValidation("Cookie", freshLiveCookie);

        var responseMessage = await httpClient.SendAsync(requestMessage);

        context.Response.StatusCode = (int)responseMessage.StatusCode;

        // Copy response headers
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

app.MapRazorPages();

if (app.Environment.IsDevelopment())
{
    app.UseSpa(spa =>
    {
        spa.Options.SourcePath = "../securityadmin";
        spa.UseProxyToSpaDevelopmentServer("http://localhost:54080");
    });
}

app.MapFallbackToPage("/admin/{**path}", "/Admin");

app.Run();