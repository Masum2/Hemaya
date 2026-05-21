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
        string freshLiveCookie = "ARRAffinity=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; ARRAffinitySameSite=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; .AspNetCore.Antiforgery.cdV5uW_Ejgc=CfDJ8LbtibfgVHBJjONX366BUVm2i-YMzrfsKboLXidJMQrRDXV_V34CBzKqKyQhwvUKNTfeldDbTyCzl8lopVr9jjOMUsVGUrXAssEhOILivaKarw7JRprlLBnP5FJCB7z5VoNjdU7G5K_N_E71pT4uIIY; .AspNetCore.Cookies=CfDJ8LbtibfgVHBJjONX366BUVkDulR4uWicsVIOgKkvE4p6cJ-jRPH4eGjB1TDLgVRcrj3s9UYp3MtU3vlyvUdlZu2sqeUqi5fCMh32YSx0lh2hDzZrK2fLlXGwvSOw-gtw5zI5iPNg5qynBJh98yDJ1fcB30WtTKXnd228ysN1SCSXUhCk7U10YwsBWgOuKuDz0YGyjzKyat5GElYklRDBySXk0Xdm70g3fU2_39TNrFz3CvdEWFe8ocAAfyDVQkXTUKH_tokao4-SV5rt_f7wbJtBjaszMDCmCz7uh_h1ECVEd5HpXeFiFwn49msaDxFiKpzgmLP6-uh4SF7cShDgI3a_-UU2R5P_vhCOgkgz9dvZVAj-wm1f9t52Hyp3X36QHhVsz48Y16O0sxjM43mZa7jDqT-sDWfMdEzJt5BmDGEVPI_N-7cnRj-Ad12XKMwNQ2QNTtI1PvZt8hirXhyDSpIW6XGHypqxjcd0qGSbM3yUt1zW3olYuU8BcJ3bSMjoxa78b30l5KyNdtX-GMThXAdJYPH5z6XyVcAMXYc5v19a8D6yteEO2lPBS5Pk6VeTv9RyQZeKhbBKDeUAwuowIRM3wWeqYeBoKcAdUwhSqNAgghdHk-AEABzN5VpvuS4At1lbQIO26iSVvtX6n7bs2RMUkMDGpqlqBQI3GcLzdNizuPxtJml_DMY1QT1uDWbmrtQJQp_LfzzHR4efomPRaABlGYBNP8JW_JIyclSILdrQBI2pr3MFjlXfxCEihfmghS1OWbR2Sf7qfW4GRKXPcYNrVABqqASZAWqajaCPxCXlRMhHs47qnfAniqqhsOHNzDlyG4867ZqtmJ2rw1q34Iwj1RswoTrNxp-DdYNnZ5UVjuaJTwk3lFfy82OIOHLNq2SKPPvi3qDw3mWYBj22Rl0Ku2N56ji7eNn9d5SkEXHQcZQucuHLR2FyZ1AIu0YzpnxjoZxVWUn6vJoZQgDsmhTMf4rETGFqs_WTFSSlrF0luvq5u9cnsezuDs4FJnWy_NMOzSSAqg_skPrHynrcHA508CKrRzAn8ce1pHUn1qBT7diAN_zK4yXXp55pQWHCcBNNETKy1bhZewh0aLiX0gtAMrltPavjHdyB_M4I47sPePquMLjt5WNFSbwexSuJRBFcamV5Ddy2sm7KZ-VNKTUgxUtdhPGtjeXOAkkldk_WOIEUM_XAb727Jtk1yNA-pMYCimNdAyXSZJkrVIK-13go2Eo_ECrwn-CVMm_sO7ni1U0URhUC8pQIAF4fl-anLbsaDyQdrXNfd17IJHpaSUDfmOG5Hjebf0EyLEXQn8CAXXa1phqrMTt-WROFBDFEyNlEP-nq-rJem553AkMws48Ss83ILIN0QGzOA-qfgGQD9gLWUYzSP74UsyxCszvFi1aH3M3MoeVMYdpyr3ltJyQgJTRvbRv7gR1W_kV7WptkczKzTu63ESSTS9_6-LU-wnnUuosjqKjBEmncVWDtiezvFgZkowfxw6tljIfPNiicmsQy8JagS3rERJsIBuhuXN31YOlrQJiNNaRQ_soMTN7FUgG9JRQWHJ3Y7cMXx4TWa5Han5kTyw5JZpEscfzkdOTWYy-yQsmGcdcvoxWvfH4o-MraB8bcwScJ40pU4Lu_3uHu9xX6DfKMN2YFL_yz7JaXxCX0utfjUtDQzRMyIsvnDqgOe_AlTWsNUQCTan8V-Q08CAxrHT2UfGaEhR54E2OERWZOR-XBsUbogEws6gX0_X7veXcQpMyMX7wWZO36TldAcKqrwaHw0gNi-lG0b7p6M1HIie20asxr_Ok1YZLlQArYfAvTEJF0Ash9MLP_Xpurvr6_-6c0W1_dpAwTNr0k487lWO-FGTwwvSHfkZjSJ4FniXX2-40xGfkVF-GYixwH0316JyAwTahYI1u_2Yvo6MXWatv_9LAfk1ivtZwt0u9kwxROmp0GhC-3sKlnOIHCrNpVf1jExh0PuTWDVDpl3aSeSzu6nihK-6W7Km58-tbs_dJ1g9E1eDbVDXsAP5lqlkVlv5p2njTrED2AnoqMIhkdC-CScRawPiNSKmFIdEkEBvHQUem_w6SvSnzWdRdtZNckm5LRkOLxPgOz2uuSAxmxXYaX0sMHoEy__HwuFBkRzWFExtd-vU1gb7MHRIcNk371HDGNVYPzhvYSOy2xCQY4mBAzmONm8hrGNz-a1rthOnVMGcCK4D4TqewpvnOGWlfKU1fYFIgggRMmN__UU_mv9RUyu7J3NvPnu5lVLBV5CU4bmP_v41hRXaU7PDQbkEb8NMyZ1J-rDZ3yU36YmWcZp0afwf4RfxVyYaxSL37VkNnbhAwarPtP9NdFwgkl7CnPunkIh4mNUJhQXnh176nkiEOLMkIvJNXvxRc; .AspNetCore.Session=CfDJ8LbtibfgVHBJjONX366BUVkbQ%2B3fnya5HDVfjFZqRCO%2BvKqP1M6gjHuQcoq4WQFz07NtFkDR%2BeWUgyHCT9EyrwRdPf8XXVKvwP%2FDoRWTt8IGOi4xDdzgbHGovH0GS%2B8%2B6cQ7hS7G%2BX%2FRCZowkj5ubtuK3Ff0TQpW%2FBShDdCdgtbv";

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