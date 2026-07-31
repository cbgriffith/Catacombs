import React from "react";

const providerLogoBaseUrl = "https://image.tmdb.org/t/p/w92";

const uniqueProviders = (...providerLists) => {
    const providersById = new Map();

    providerLists.flat().forEach((provider) => {
        if (provider?.provider_id) {
            providersById.set(provider.provider_id, provider);
        }
    });

    return Array.from(providersById.values());
};

const ProviderList = ({ providers }) => (
    <div className="where-to-watch-providers">
        {providers.map((provider) => (
            <div
                className="where-to-watch-provider"
                key={provider.provider_id}
                title={provider.provider_name}
            >
                {provider.logo_path && (
                    <img
                        src={`${providerLogoBaseUrl}${provider.logo_path}`}
                        alt=""
                        aria-hidden="true"
                    />
                )}
                <span>{provider.provider_name}</span>
            </div>
        ))}
    </div>
);

export const WhereToWatch = ({ movieTitle, watchProviders }) => {
    const availability = watchProviders?.results?.US;
    const groups = availability ? [
        {
            key: "stream",
            title: "Stream",
            providers: uniqueProviders(availability.flatrate || [])
        },
        {
            key: "free",
            title: "Free",
            providers: uniqueProviders(
                availability.free || [],
                availability.ads || []
            )
        },
        {
            key: "rent",
            title: "Rent",
            providers: uniqueProviders(availability.rent || [])
        },
        {
            key: "buy",
            title: "Buy",
            providers: uniqueProviders(availability.buy || [])
        }
    ].filter((group) => group.providers.length > 0) : [];

    return (
        <section
            className="where-to-watch"
            aria-labelledby="where-to-watch-heading"
        >
            <div className="where-to-watch-heading">
                <div>
                    <p className="movie-details-eyebrow">Available in the U.S.</p>
                    <h2 id="where-to-watch-heading">Where to Watch</h2>
                </div>
                {availability?.link && (
                    <a
                        href={availability.link}
                        target="_blank"
                        rel="noreferrer"
                    >
                        View current options
                    </a>
                )}
            </div>

            {groups.length > 0 ? (
                <div className="where-to-watch-groups">
                    {groups.map((group) => (
                        <div
                            className="where-to-watch-group"
                            key={group.key}
                        >
                            <h3>{group.title}</h3>
                            <ProviderList providers={group.providers} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="where-to-watch-empty">
                    No U.S. streaming, rental, or purchase listings are
                    currently available for {movieTitle}.
                </p>
            )}

            <p className="where-to-watch-credit">
                Availability data provided by{" "}
                <a
                    href="https://www.justwatch.com/"
                    target="_blank"
                    rel="noreferrer"
                >
                    JustWatch
                </a>
                . Listings may change.
            </p>
        </section>
    );
};
