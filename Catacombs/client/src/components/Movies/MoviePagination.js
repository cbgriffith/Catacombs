import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import {
    Pagination,
    PaginationItem,
    PaginationLink
} from "reactstrap";

const visiblePageNumbers = (currentPage, totalPages) => {
    const firstVisiblePage = Math.max(
        1,
        Math.min(currentPage - 2, totalPages - 4)
    );
    const lastVisiblePage = Math.min(
        totalPages,
        firstVisiblePage + 4
    );

    return Array.from(
        { length: lastVisiblePage - firstVisiblePage + 1 },
        (_, index) => firstVisiblePage + index
    );
};

export const MoviePagination = ({
    basePath,
    currentPage,
    totalPages
}) => {
    const lastPage = Math.min(totalPages, 500);

    if (lastPage <= 1) {
        return null;
    }

    const pagePath = (page) => (
        page === 1 ? basePath : `${basePath}/${page}`
    );
    const pageNumbers = visiblePageNumbers(currentPage, lastPage);
    const showFirstPage = pageNumbers[0] > 1;
    const showLastPage =
        pageNumbers[pageNumbers.length - 1] < lastPage;

    return (
        <Pagination
            className="movie-pagination"
            aria-label="Movie result pages"
        >
            <PaginationItem disabled={currentPage === 1}>
                {currentPage === 1 ? (
                    <PaginationLink
                        previous
                        tag="span"
                        aria-label="Previous page"
                    />
                ) : (
                    <PaginationLink
                        previous
                        tag={RouterNavLink}
                        to={pagePath(currentPage - 1)}
                        aria-label="Previous page"
                    />
                )}
            </PaginationItem>

            {showFirstPage && (
                <>
                    <PaginationItem>
                        <PaginationLink
                            tag={RouterNavLink}
                            to={pagePath(1)}
                            aria-label="Page 1"
                        >
                            1
                        </PaginationLink>
                    </PaginationItem>
                    {pageNumbers[0] > 2 && (
                        <PaginationItem disabled>
                            <PaginationLink tag="span">…</PaginationLink>
                        </PaginationItem>
                    )}
                </>
            )}

            {pageNumbers.map((page) => (
                <PaginationItem
                    active={page === currentPage}
                    key={page}
                >
                    <PaginationLink
                        tag={RouterNavLink}
                        to={pagePath(page)}
                        aria-label={`Page ${page}`}
                        aria-current={
                            page === currentPage ? "page" : undefined
                        }
                    >
                        {page}
                    </PaginationLink>
                </PaginationItem>
            ))}

            {showLastPage && (
                <>
                    {pageNumbers[pageNumbers.length - 1] <
                        lastPage - 1 && (
                        <PaginationItem disabled>
                            <PaginationLink tag="span">…</PaginationLink>
                        </PaginationItem>
                    )}
                    <PaginationItem>
                        <PaginationLink
                            tag={RouterNavLink}
                            to={pagePath(lastPage)}
                            aria-label={`Page ${lastPage}`}
                        >
                            {lastPage}
                        </PaginationLink>
                    </PaginationItem>
                </>
            )}

            <PaginationItem disabled={currentPage === lastPage}>
                {currentPage === lastPage ? (
                    <PaginationLink
                        next
                        tag="span"
                        aria-label="Next page"
                    />
                ) : (
                    <PaginationLink
                        next
                        tag={RouterNavLink}
                        to={pagePath(currentPage + 1)}
                        aria-label="Next page"
                    />
                )}
            </PaginationItem>
        </Pagination>
    );
};
